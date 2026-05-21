from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.cache import cache
from django.utils import timezone
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
import sys
import pyotp
import qrcode
import io
import base64
import random
import string

from .models import UserProfile
from platform_core.models import AuditLog, BitacoraCambios
from .serializers import (
    LoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UsuarioGuardiaListSerializer,
    UsuarioGuardiaCreateSerializer,
    UsuarioGuardiaUpdateSerializer,
)
from config.email_service import send_login_notification


def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))


def send_verification_code_email(profile):
    """Send verification code via email"""
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    from datetime import timedelta

    code = generate_verification_code()
    expires_at = timezone.now() + timedelta(minutes=5)

    profile.verification_code = code
    profile.verification_code_expires = expires_at
    profile.verification_attempts = 0
    profile.save()

    user = profile.user
    fecha_hora = timezone.now().strftime('%d/%m/%Y %H:%M')

    subject = '[LRA Checklist] Codigo de verificacion'
    html_content = f'''
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">LRA Checklist Vehicular</h2>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
            <h3 style="color: #059669;">Hola {profile.full_name or user.username},</h3>
            <p>Se ha solicitado un codigo de verificacion para tu cuenta.</p>
            <div style="background: #dcfce7; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Tu codigo de verificacion es:</p>
                <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px;">
                    {code}
                </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
                Este codigo expira en <strong>5 minutos</strong>.<br/>
                Hora de solicitud: {fecha_hora}
            </p>
            <p style="color: #dc2626; font-size: 14px; margin-top: 15px;">
                Si no solicitaste este codigo, ignora este email.
            </p>
        </div>
        <div style="padding: 15px; background: #047857; color: white; text-align: center; font-size: 12px;">
            Sistema de Checklist Vehicular - LRA
        </div>
    </div>
    '''

    email = EmailMultiAlternatives(
        subject=subject,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email] if user.email else [settings.DEFAULT_FROM_EMAIL]
    )
    email.attach_alternative(html_content, 'text/html')
    try:
        email.send()
    except Exception as e:
        import logging
        logger = logging.getLogger('django')
        logger.error(f'Error enviando codigo de verificacion a {user.email}: {e}')

    return code


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'El usuario no existe.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {'error': 'La contraseña es incorrecta.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'El usuario está inactivo.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'El usuario no tiene perfil asignado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not profile.is_active_user:
            return Response(
                {'error': 'El perfil del usuario está desactivado.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if profile.is_locked():
            locked_until = profile.verification_locked_until.strftime('%H:%M')
            return Response(
                {'error': f'Cuenta bloqueada. Intenta de nuevo después de las {locked_until}.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Generate temp token for 2FA verification
        from rest_framework_simplejwt.tokens import RefreshToken
        temp_token = RefreshToken.for_user(user)
        temp_token['temp'] = True
        temp_token['user_id'] = user.id

        # Send verification code via email
        send_verification_code_email(profile)

        return Response({
            'requires_verification': True,
            'temp_token': str(temp_token),
            'message': 'Se ha enviado un código de verificación a tu email.',
            'expires_in': 300
        }, status=status.HTTP_200_OK)


class VerifyCodeAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        temp_token = request.data.get('temp_token')
        code = request.data.get('code')

        if not temp_token or not code:
            return Response(
                {'error': 'Token y código son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(temp_token)

            if not token.get('temp'):
                return Response(
                    {'error': 'Token inválido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_id = token.get('user_id')
            user = User.objects.get(id=user_id)
            profile = user.profile

            if profile.is_locked():
                return Response(
                    {'error': 'Cuenta bloqueada por demasiados intentos fallidos.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            if not profile.has_verification_code():
                return Response(
                    {'error': 'El código ha expirado. Solicita uno nuevo.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if profile.verification_code != code:
                profile.verification_attempts += 1
                profile.save()

                if profile.verification_attempts >= 3:
                    from datetime import timedelta
                    profile.verification_locked_until = timezone.now() + timedelta(minutes=15)
                    profile.verification_code = None
                    profile.verification_code_expires = None
                    profile.save()
                    return Response(
                        {'error': 'Demasiados intentos fallidos. Bloqueado por 15 minutos.'},
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )

                remaining = 3 - profile.verification_attempts
                return Response(
                    {'error': f'Código incorrecto. Intentos restantes: {remaining}'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            profile.verification_code = None
            profile.verification_code_expires = None
            profile.verification_attempts = 0
            profile.verification_locked_until = None
            profile.save()

            refresh = RefreshToken.for_user(user)

            # Don't block login if email fails - continue silently
            try:
                send_login_notification(profile, request)
            except Exception as e:
                print(f'Login notification email failed (non-blocking): {e}')

            try:
                AuditLog.objects.create(
                    usuario=user,
                    modulo='accesos',
                    accion='login',
                    descripcion=f'El usuario {user.username} inició sesión.',
                    entidad_tipo='User',
                    entidad_id=user.id,
                    turno=None
                )
                BitacoraCambios.objects.create(
                    tabla_affectada='auth_user',
                    registro_id=user.id,
                    accion='LOGIN',
                    datos_anteriores={},
                    datos_nuevos={'username': user.username, 'email': user.email},
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    usuario=user
                )
            except Exception as e:
                print(f'Error creating audit log: {e}')

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': profile.role,
                    'full_name': profile.full_name,
                    'phone': profile.phone,
                    'photo': profile.photo.url if profile.photo else None,
                }
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {'error': 'Token inválido o expirado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResendCodeAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        temp_token = request.data.get('temp_token')

        if not temp_token:
            return Response(
                {'error': 'Token es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(temp_token)

            if not token.get('temp'):
                return Response(
                    {'error': 'Token inválido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_id = token.get('user_id')
            user = User.objects.get(id=user_id)
            profile = user.profile

            if profile.is_locked():
                return Response(
                    {'error': 'Cuenta bloqueada. Espera unos minutos.'},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            send_verification_code_email(profile)

            return Response({
                'message': 'Código reenviado exitosamente.',
                'expires_in': 300
            }, status=status.HTTP_200_OK)

        except TokenError:
            return Response(
                {'error': 'Token inválido o expirado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginVerify2FA(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        temp_token = request.data.get('temp_token')
        code = request.data.get('code')

        if not temp_token or not code:
            return Response(
                {'error': 'Token temporal y código son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validate temp token
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import TokenError

            token = RefreshToken(temp_token)

            if not token.get('temp'):
                return Response(
                    {'error': 'Token inválido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user_id = token.get('user_id')
            user = User.objects.get(id=user_id)
            profile = user.profile

            if not profile.two_factor_enabled or not profile.two_factor_secret:
                return Response(
                    {'error': '2FA no está habilitado para este usuario.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the code
            totp = pyotp.TOTP(profile.two_factor_secret)
            if totp.verify(code):
                # Code is valid - mark as verified for this session
                profile.two_factor_verified = True
                profile.save()

                # Generate real tokens
                refresh = RefreshToken.for_user(user)

                # Send login notification email
                send_login_notification(profile, request)

                # Create AuditLog for login
                try:
                    AuditLog.objects.create(
                        usuario=user,
                        modulo='accesos',
                        accion='login',
                        descripcion=f'El usuario {user.username} inici\u00f3 sesi\u00f3n con 2FA.',
                        entidad_tipo='User',
                        entidad_id=user.id,
                        turno=None
                    )
                    BitacoraCambios.objects.create(
                        tabla_afectada='auth_user',
                        registro_id=user.id,
                        accion='LOGIN',
                        datos_anteriores={},
                        datos_nuevos={'username': user.username, 'email': user.email, '2fa': True},
                        ip_address=request.META.get('REMOTE_ADDR', ''),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        usuario=user
                    )
                except Exception as e:
                    print(f'Error creating audit log: {e}')

                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'role': profile.role,
                        'full_name': profile.full_name,
                        'phone': profile.phone,
                        'photo': profile.photo.url if profile.photo else None,
                        'two_factor_enabled': profile.two_factor_enabled,
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Código de verificación incorrecto.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        except TokenError as e:
            return Response(
                {'error': 'Token inválido o expirado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class Setup2FA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Generate new secret
        secret = pyotp.random_base32()

        # Generate QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=request.user.username,
            issuer_name='Checklist Vehicular'
        )

        # Generate QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()

        # Temporarily store secret until verified
        cache.set(f'2fa_setup_{request.user.id}', secret, timeout=300)  # 5 min

        return Response({
            'secret': secret,
            'qr_code': f'data:image/png;base64,{qr_base64}',
            'message': 'Escanea el código QR con tu app de autenticación.'
        }, status=status.HTTP_200_OK)


class Verify2FA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')

        if not code:
            return Response(
                {'error': 'Código es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get pending secret from cache
        pending_secret = cache.get(f'2fa_setup_{request.user.id}')

        if pending_secret:
            # Verify setup
            totp = pyotp.TOTP(pending_secret)
            if totp.verify(code):
                # Enable 2FA
                profile.two_factor_secret = pending_secret
                profile.two_factor_enabled = True
                profile.save()
                cache.delete(f'2fa_setup_{request.user.id}')

                return Response({
                    'message': '2FA habilitado exitosamente.',
                    'two_factor_enabled': True
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Código incorrecto. Intenta de nuevo.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif profile.two_factor_secret:
            # Verify existing 2FA
            totp = pyotp.TOTP(profile.two_factor_secret)
            if totp.verify(code):
                return Response({
                    'message': 'Código verificado.',
                    'verified': True
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Código incorrecto.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'No hay configuración pendiente. Genera un código QR primero.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class Disable2FA(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')

        if not code:
            return Response(
                {'error': 'Código es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not profile.two_factor_secret:
            return Response(
                {'error': '2FA no está habilitado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify code before disabling
        totp = pyotp.TOTP(profile.two_factor_secret)
        if totp.verify(code):
            profile.two_factor_enabled = False
            profile.two_factor_secret = None
            profile.two_factor_verified = False
            profile.save()

            return Response({
                'message': '2FA deshabilitado exitosamente.',
                'two_factor_enabled': False
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Código incorrecto. No se pudo deshabilitar 2FA.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(profile, context={'request': request})
        data = serializer.data
        print(f"[DEBUG] MeAPIView photo URL: {data.get('photo')}", file=sys.stderr)
        print(f"[DEBUG] MeAPIView full response: {data}", file=sys.stderr)
        return Response(data, status=status.HTTP_200_OK)


class MeUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        cache_key = f'profile_update_rate_limit_{request.user.id}'
        last_update = cache.get(cache_key)
        if last_update:
            cache.delete(cache_key)

        serializer = UserProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True
)

        if serializer.is_valid():
            print(f"[DEBUG] MeUpdateAPIView data keys: {list(request.data.keys())}", file=sys.stderr)
            print(f"[DEBUG] MeUpdateAPIView FILES: {dict(request.FILES) if request.FILES else 'empty'}", file=sys.stderr)
            print(f"[DEBUG] request.content_type: {request.content_type}", file=sys.stderr)
            print(f"[DEBUG] validated_data: {serializer.validated_data}", file=sys.stderr)
            print(f"[DEBUG] request.data.get('is_active'): {request.data.get('is_active')}", file=sys.stderr)
            try:
                profile = serializer.save()
                print(f"[DEBUG] Profile saved successfully", file=sys.stderr)
                print(f"[DEBUG] profile.photo after save: {profile.photo}", file=sys.stderr)
                if profile.photo:
                    print(f"[DEBUG] profile.photo.name: {profile.photo.name}", file=sys.stderr)
                    print(f"[DEBUG] profile.photo.url: {profile.photo.url}", file=sys.stderr)
            except Exception as e:
                import traceback
                traceback.print_exc(file=sys.stderr)
                return Response(
                    {'error': f'Error al guardar perfil: {type(e).__name__}: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            cache.set(cache_key, True, timeout=15 * 60)
            AuditLog.objects.create(
                usuario=request.user,
                modulo='perfil',
                accion='editar',
                descripcion='El usuario actualizó su perfil.',
                entidad_tipo='UserProfile',
                entidad_id=profile.id,
                turno=None
            )
            return Response(
                {
                    'message': 'Perfil actualizado correctamente.',
                    'data': UserProfileSerializer(profile, context={'request': request}).data
                },
                status=status.HTTP_200_OK
            )

        print(f"[DEBUG] MeUpdateAPIView serializer.errors: {serializer.errors}", file=sys.stderr)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioGuardiaListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UsuarioGuardiaListSerializer

    def get_queryset(self):
        queryset = User.objects.select_related('profile').all().order_by('username')

        role = self.request.query_params.get('role')
        q = self.request.query_params.get('q')

        if role:
            queryset = queryset.filter(profile__role=role)

        if q:
            queryset = queryset.filter(username__icontains=q) | queryset.filter(profile__full_name__icontains=q)

        return queryset


class UsuarioGuardiaCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.profile.role != 'admin':
            return Response(
                {'error': 'Solo administradores pueden crear usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = UsuarioGuardiaCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            AuditLog.objects.create(
                usuario=request.user,
                modulo='usuarios',
                accion='crear',
                descripcion=f'Se creó el usuario {user.username} con rol {user.profile.role}.',
                entidad_tipo='User',
                entidad_id=user.id,
                turno=None
            )
            return Response(
                {
                    'message': 'Usuario creado correctamente.',
                    'data': UsuarioGuardiaListSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsuarioGuardiaDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.profile.role != 'admin':
            return Response(
                {'error': 'Solo administradores pueden ver detalles de usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UsuarioGuardiaListSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        if request.user.profile.role != 'admin':
            return Response(
                {'error': 'Solo administradores pueden editar usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UsuarioGuardiaUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                user = serializer.save()
            except Exception as e:
                import traceback
                traceback.print_exc(file=sys.stderr)
                return Response(
                    {'error': f'Error al guardar: {type(e).__name__}: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            AuditLog.objects.create(
                usuario=request.user,
                modulo='usuarios',
                accion='editar',
                descripcion=f'Se editó el usuario {user.username}.',
                entidad_tipo='User',
                entidad_id=user.id,
                turno=None
            )
            return Response(
                {
                    'message': 'Usuario actualizado correctamente.',
                    'data': UsuarioGuardiaListSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        print(f"[DEBUG] About to return 400 with errors: {serializer.errors}", file=sys.stderr)
        print(f"[DEBUG] Request data was: {dict(request.data)}", file=sys.stderr)
        return Response({'serializer_errors': serializer.errors, 'request_data': dict(request.data)}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        if request.user.profile.role != 'admin':
            return Response(
                {'error': 'Solo administradores pueden eliminar usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
)

        if user.id == request.user.id:
            return Response(
                {'error': 'No puedes eliminarte a ti mismo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = user.username
        user.is_active = False
        user.save()

        try:
            AuditLog.objects.create(
                usuario=request.user,
                modulo='usuarios',
                accion='editar',
                descripcion=f'Se desactivó el usuario {username}.',
                entidad_tipo='User',
                entidad_id=user.id,
                turno=None
            )
        except Exception as e:
            print(f"[DEBUG] AuditLog error: {e}")

        return Response(
            {'message': 'Usuario desactivado correctamente.'},
            status=status.HTTP_200_OK
        )


class RefreshTokenAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {'error': 'Refresh token requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            refresh = RefreshToken(refresh_token)

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {'error': 'Token inválido o expirado.', 'detail': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except InvalidToken as e:
            return Response(
                {'error': 'Token inválido.', 'detail': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class TokenVerifyAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')

        if not token:
            return Response(
                {'error': 'Token requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

            from rest_framework_simplejwt.tokens import AccessToken
            access = AccessToken(token)

            return Response({
                'valid': True,
                'user_id': access.payload.get('user_id'),
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {'valid': False, 'error': 'Token inválido o expirado.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'valid': False, 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            refresh_token = request.data.get('refresh')

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception:
                    pass

            try:
                AuditLog.objects.create(
                    usuario=user,
                    modulo='accesos',
                    accion='logout',
                    descripcion=f'El usuario {user.username} cerr\u00f3 sesi\u00f3n.',
                    entidad_tipo='User',
                    entidad_id=user.id,
                    turno=None
                )
                BitacoraCambios.objects.create(
                    tabla_affectada='auth_user',
                    registro_id=user.id,
                    accion='LOGOUT',
                    datos_anteriores={'username': user.username},
                    datos_nuevos={},
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    usuario=user
                )
            except Exception:
                pass

            return Response(
                {'message': 'Sesión cerrada correctamente.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.utils import timezone
        from datetime import timedelta
        import random

        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'El correo electronico es requerido.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            profile = user.profile
        except User.DoesNotExist:
            return Response(
                {'message': 'Si el correo esta registrado, recibiras un codigo de recuperacion.'},
                status=status.HTTP_200_OK
            )

        if not profile.is_active_user or not user.is_active:
            return Response(
                {'message': 'Si el correo esta registrado, recibiras un codigo de recuperacion.'},
                status=status.HTTP_200_OK
            )

        if profile.is_locked():
            return Response(
                {'error': 'Demasiados intentos. Intenta de nuevo en 15 minutos.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        code = ''.join(random.choices('0123456789', k=6))
        expires = timezone.now() + timedelta(minutes=5)

        profile.verification_code = code
        profile.verification_code_expires = expires
        profile.verification_attempts = 0
        profile.save()

        subject = '[LRA Checklist] Codigo para restablecer contrasena'
        html_content = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">LRA Checklist Vehicular</h2>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
                <h3 style="color: #059669;">Hola {profile.full_name or user.username},</h3>
                <p>Se ha solicitado un restablecimiento de contrasena para tu cuenta.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 18px;">Tu codigo de verificacion es:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669;">{code}</p>
                    <p style="font-size: 14px; color: #6b7280;">Este codigo expira en 5 minutos</p>
                </div>
            </div>
            <div style="padding: 15px; background: #047857; color: white; text-align: center; font-size: 12px;">
                Sistema de Checklist Vehicular - LRA
            </div>
        </div>
        '''

        email_msg = EmailMultiAlternatives(
            subject=subject,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email_msg.attach_alternative(html_content, 'text/html')
        try:
            email_msg.send()
        except Exception as e:
            import logging
            logger = logging.getLogger('django')
            logger.error(f'Error enviando codigo de password reset a {email}: {e}')

        return Response(
            {'message': 'Si el correo esta registrado, recibiras un codigo de recuperacion.'},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.hashers import make_password
        from datetime import timedelta

        code = request.data.get('code', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not code or not new_password:
            return Response(
                {'error': 'Codigo y nueva contrasena son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'La contrasena debe tener al menos 8 caracteres.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not any(c.isupper() for c in new_password):
            return Response(
                {'error': 'La contrasena debe tener al menos una letra mayuscula.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not any(c.isdigit() for c in new_password):
            return Response(
                {'error': 'La contrasena debe tener al menos un numero.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in new_password):
            return Response(
                {'error': 'La contrasena debe tener al menos un caracter especial (!@#$%^&*()_+-=[]{}|;:,.<>?).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = UserProfile.objects.select_related('user').get(
                verification_code=code,
                verification_code_expires__gt=timezone.now()
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Codigo invalido o expirado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if profile.verification_locked_until and profile.verification_locked_until > timezone.now():
            return Response(
                {'error': 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        user = profile.user
        user.password = make_password(new_password)
        user.save()

        profile.verification_code = None
        profile.verification_code_expires = None
        profile.verification_attempts = 0
        profile.verification_locked_until = None
        profile.save()

        return Response(
            {'message': 'Contrasena actualizada correctamente. Ya puedes iniciar sesion.'},
            status=status.HTTP_200_OK
        )


class GoogleOAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from allauth.socialaccount.models import SocialAccount
        from django.contrib.auth import get_user_model
        import requests
        import random

        User = get_user_model()
        google_user_id = request.data.get('google_user_id')
        access_token = request.data.get('access_token')

        if not google_user_id or not access_token:
            return Response(
                {'error': 'Google user ID y access token son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_info_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'}
            )
            if user_info_response.status_code != 200:
                return Response(
                    {'error': 'Token de Google invalido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_info = user_info_response.json()
        except Exception:
            return Response(
                {'error': 'Error verificando con Google'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user_info.get('sub') != google_user_id:
            return Response(
                {'error': 'ID de usuario de Google no coincide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        google_email = user_info.get('email')

        # Check if email already exists in system (Option B)
        if google_email and User.objects.filter(email=google_email).exists():
            return Response(
                {'error': 'Ya existe una cuenta con este correo. Usa tu usuario y contrasena para iniciar sesion.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            social_account = SocialAccount.objects.get(provider='google', uid=google_user_id)
            user = social_account.user
        except SocialAccount.DoesNotExist:
            # Create new user
            username = google_email.split('@')[0] if google_email else google_user_id
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=google_email,
                password=None,
                first_name=user_info.get('given_name', ''),
                last_name=user_info.get('family_name', ''),
            )
            user.is_active = True
            user.save()

            from .models import UserProfile
            UserProfile.objects.create(
                user=user,
                full_name=f"{user_info.get('given_name', '')} {user_info.get('family_name', '')}".strip(),
                telefono='',
                empresa='LRA',
                is_active_user=True,
                is_admin=False,
            )

            social_account = SocialAccount.objects.create(
                provider='google',
                uid=google_user_id,
                user=user,
                extra_data=user_info
            )

        if not user.is_active:
            return Response(
                {'error': 'Usuario desactivado'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = user.profile
            if not profile.is_active_user:
                return Response(
                    {'error': 'Usuario desactivado'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Exception:
            return Response(
                {'error': 'Perfil de usuario no encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate 6-digit code for 2FA
        code = ''.join(random.choices('0123456789', k=6))
        expires = timezone.now() + timedelta(minutes=5)

        profile.verification_code = code
        profile.verification_code_expires = expires
        profile.verification_attempts = 0
        profile.save()

        # Send 2FA code via email
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings

        subject = '[LRA Checklist] Codigo de verificacion'
        html_content = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">LRA Checklist Vehicular</h2>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
                <h3 style="color: #059669;">Hola {profile.full_name or user.username},</h3>
                <p>Has iniciado sesion con Google. Tu codigo de verificacion es:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669;">{code}</p>
                    <p style="font-size: 14px; color: #6b7280;">Este codigo expira en 5 minutos</p>
                </div>
            </div>
            <div style="padding: 15px; background: #047857; color: white; text-align: center; font-size: 12px;">
                Sistema de Checklist Vehicular - LRA
            </div>
        </div>
        '''

        if user.email:
            email_msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email_msg.attach_alternative(html_content, 'text/html')
            try:
                email_msg.send()
            except Exception as e:
                import logging
                logger = logging.getLogger('django')
                logger.error(f'Error enviando codigo de verificacion TOTP a {user.email}: {e}')

        from rest_framework_simplejwt.tokens import RefreshToken
        temp_token = RefreshToken.for_user(user)
        temp_token['temp'] = True
        temp_token['user_id'] = user.id

        return Response({
            'requires_verification': True,
            'temp_token': str(temp_token),
            'message': 'Se ha enviado un codigo de verificacion a tu email.',
            'expires_in': 300
        }, status=status.HTTP_200_OK)


class CreateTestUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth.models import User
        from .models import UserProfile

        username = request.data.get('username', 'guardia1')
        email = request.data.get('email', 'guardia1@test.com')
        password = request.data.get('password', 'Test123!')
        full_name = request.data.get('full_name', 'Guardia Uno')
        rol = request.data.get('rol', 'guardia')

        try:
            user = User.objects.get(username=username)
            profile = UserProfile.objects.get(user=user)
            return Response({'message': 'El usuario ya existe', 'username': username}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True
            )
            profile = UserProfile.objects.create(
                user=user,
                full_name=full_name,
                role=rol,
                is_active=True
            )
            return Response({
                'message': 'Usuario creado exitosamente',
                'user': {
                    'id': user.id,
                    'username': username,
                    'email': email,
                    'full_name': full_name,
                    'rol': rol
                }
            }, status=status.HTTP_201_CREATED)
        except UserProfile.DoesNotExist:
            user.set_password(password)
            user.save()
            profile = UserProfile.objects.create(
                user=user,
                full_name=full_name,
                role=rol,
                is_active=True
            )
            return Response({
                'message': 'Usuario actualizado (perfil creado)',
                'user': {
                    'id': user.id,
                    'username': username,
                    'email': email,
                    'full_name': full_name,
                    'rol': rol
                }
            }, status=status.HTTP_200_OK)
