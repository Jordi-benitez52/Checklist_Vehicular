from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.cache import cache
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from .models import UserProfile
from platform_core.models import AuditLog
from .serializers import (
    LoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UsuarioGuardiaListSerializer,
    UsuarioGuardiaCreateSerializer,
    UsuarioGuardiaUpdateSerializer,
)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # 1. Verificar que el usuario existe
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'El usuario no existe.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 2. Verificar que la contraseña es correcta
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

        refresh = RefreshToken.for_user(user)

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

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


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
            return Response(
                {'error': 'Debes esperar 15 minutos antes de volver a actualizar tu perfil.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = UserProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            profile = serializer.save()
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
                    'data': UserProfileSerializer(profile).data
                },
                status=status.HTTP_200_OK
            )

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
            user = serializer.save()
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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        user.delete()

        AuditLog.objects.create(
            usuario=request.user,
            modulo='usuarios',
            accion='eliminar',
            descripcion=f'Se eliminó el usuario {username}.',
            entidad_tipo='User',
            entidad_id=pk,
            turno=None
        )

        return Response(
            {'message': 'Usuario eliminado correctamente.'},
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
                status=status.HTTP_401_UNAUTHORIZED
            )
