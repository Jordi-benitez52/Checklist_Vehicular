from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile
import sys


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'username',
            'email',
            'role',
            'full_name',
            'phone',
            'photo',
            'is_active_user',
        ]

    def get_photo(self, obj):
        try:
            if obj.photo:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.photo.url)
                return f"http://localhost:8000{obj.photo.url}"
            return None
        except Exception as e:
            print(f"[DEBUG] get_photo error: {e}", file=sys.stderr)
            return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    foto = serializers.ImageField(source='photo', required=False, allow_null=True)
    email = serializers.EmailField(required=False)

    class Meta:
        model = UserProfile
        fields = [
            'full_name',
            'phone',
            'photo',
            'foto',
            'email',
        ]

    def update(self, instance, validated_data):
        full_name = validated_data.get('full_name')
        if full_name is not None:
            instance.full_name = full_name

        phone = validated_data.get('phone')
        if phone is not None:
            instance.phone = phone

        foto = validated_data.get('photo')
        print(f"[DEBUG] UserProfileUpdateSerializer foto from validated_data: {foto}", file=sys.stderr)
        if foto is not None:
            print(f"[DEBUG] UserProfileUpdateSerializer setting instance.photo = foto", file=sys.stderr)
            instance.photo = foto

        email = validated_data.get('email')
        if email is not None and email != instance.user.email:
            instance.user.email = email
            instance.user.save(update_fields=['email'])

        instance.save()
        print(f"[DEBUG] UserProfileUpdateSerializer after save, instance.photo: {instance.photo}", file=sys.stderr)
        return instance


class UsuarioGuardiaListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    is_active_user = serializers.SerializerMethodField()
    numero_empleado = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'is_active',
            'role',
            'full_name',
            'phone',
            'photo',
            'is_active_user',
            'numero_empleado',
        ]

    def get_role(self, obj):
        try:
            return obj.profile.role if hasattr(obj, 'profile') and obj.profile else ''
        except Exception:
            return ''

    def get_full_name(self, obj):
        try:
            return obj.profile.full_name if hasattr(obj, 'profile') and obj.profile else ''
        except Exception:
            return ''

    def get_phone(self, obj):
        try:
            return obj.profile.phone if hasattr(obj, 'profile') and obj.profile else ''
        except Exception:
            return ''

    def get_photo(self, obj):
        try:
            return obj.profile.photo.url if hasattr(obj, 'profile') and obj.profile and obj.profile.photo else None
        except Exception:
            return None

    def get_is_active_user(self, obj):
        try:
            return obj.profile.is_active_user if hasattr(obj, 'profile') and obj.profile else True
        except Exception:
            return True

    def get_numero_empleado(self, obj):
        try:
            return obj.profile.numero_empleado if hasattr(obj, 'profile') and obj.profile else ''
        except Exception:
            return ''


class UsuarioGuardiaCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['guardia', 'admin'], default='guardia')
    numero_empleado = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El nombre de usuario ya existe.')
        return value

    def create(self, validated_data):
        email = validated_data.pop('email', '')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name')
        phone = validated_data.pop('phone', '')
        role = validated_data.pop('role', 'guardia')
        numero_empleado = validated_data.pop('numero_empleado', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=password
        )

        UserProfile.objects.create(
            user=user,
            full_name=full_name,
            phone=phone,
            role=role,
            numero_empleado=numero_empleado,
            is_active_user=True
        )

        return user


class UsuarioGuardiaUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['guardia', 'admin'], required=False)
    numero_empleado = serializers.CharField(max_length=50, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)
    is_active_user = serializers.BooleanField(required=False)
    new_password = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)

    def update(self, instance, validated_data):
        print(f"[DEBUG] UsuarioGuardiaUpdateSerializer update called, validated_data: {list(validated_data.keys())}", file=sys.stderr)
        if 'username' in validated_data and validated_data['username'] != instance.username:
            if User.objects.filter(username=validated_data['username']).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError({'username': 'El nombre de usuario ya existe.'})
            instance.username = validated_data['username']

        if 'email' in validated_data:
            instance.email = validated_data['email']

        if 'new_password' in validated_data and validated_data['new_password']:
            instance.set_password(validated_data['new_password'])

        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
            print(f"[DEBUG] Setting instance.is_active = {instance.is_active}", file=sys.stderr)

        instance.save()
        print(f"[DEBUG] instance.is_active after save: {instance.is_active}", file=sys.stderr)

        profile, created = UserProfile.objects.get_or_create(user=instance)
        if 'full_name' in validated_data:
            profile.full_name = validated_data['full_name']
        if 'phone' in validated_data:
            profile.phone = validated_data['phone']
        if 'role' in validated_data:
            profile.role = validated_data['role']
        if 'numero_empleado' in validated_data:
            profile.numero_empleado = validated_data['numero_empleado']
        if 'is_active_user' in validated_data:
            profile.is_active_user = validated_data['is_active_user']
        if 'is_active' in validated_data:
            instance.is_active = validated_data['is_active']
            instance.save()

        profile.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        min_length=1,
        allow_blank=False,
        error_messages={
            'required': 'El nombre de usuario es requerido.',
            'blank': 'El nombre de usuario no puede estar vacío.',
            'min_length': 'El nombre de usuario no puede estar vacío.'
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=1,
        allow_blank=False,
        error_messages={
            'required': 'La contraseña es requerida.',
            'blank': 'La contraseña no puede estar vacía.',
            'min_length': 'La contraseña no puede estar vacía.'
        }
    )

    def validate_username(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El nombre de usuario no puede estar vacío.')
        return value.strip()

    def validate_password(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La contraseña no puede estar vacía.')
        return value

    def validate(self, data):
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username:
            raise serializers.ValidationError({
                'username': 'El nombre de usuario no puede estar vacío.'
            })

        if not password:
            raise serializers.ValidationError({
                'password': 'La contraseña no puede estar vacía.'
            })

        data['username'] = username
        return data