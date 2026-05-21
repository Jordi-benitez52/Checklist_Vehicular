import os
import sys

# Add backend to path for Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['DATABASE_URL'] = 'postgresql://postgres:tPqPjLNyuyQOgfqgcQRbSIxdbNXOKfjq@postgres.railway.internal:5432/railway'

import django
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

# Create or get user
user, created = User.objects.get_or_create(
    username='guardia1',
    defaults={
        'email': 'guardia1@test.com',
        'is_active': True,
        'is_staff': False,
    }
)

if created:
    user.set_password('guardia123')
    user.save()
    print(f'Usuario creado: guardia1')
else:
    print(f'Usuario ya existe: guardia1')

# Create or update profile
from accounts.models import UserProfile

profile, profile_created = UserProfile.objects.get_or_create(
    user=user,
    defaults={
        'full_name': 'Guardia Prueba',
        'role': 'guardia',
        'phone': '1234567890',
        'numero_empleado': 'G001',
        'is_active': True,
        'email_on_login': False,
    }
)

if profile_created:
    print(f'Perfil creado para: guardia1')
else:
    print(f'Perfil ya existe para: guardia1')

# Verify
from django.contrib.auth import authenticate
test = authenticate(username='guardia1', password='guardia123')
if test:
    print(f'Verificación OK: {test.username}')
else:
    print('ERROR: No se pudo verificar el usuario')

print('\n=== CREDENCIALES DE PRUEBA ===')
print('Usuario: guardia1')
print('Contraseña: guardia123')