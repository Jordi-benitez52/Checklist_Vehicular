import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

# Create guardia_test user
try:
    user = User.objects.get(username='guardia_test')
    print(f'User exists: {user.username}')
except User.DoesNotExist:
    user = User.objects.create_user(
        username='guardia_test',
        email='guardia_test@demo.com',
        password=make_password('Guardia1234!')
    )
    print(f'User created: {user.username}')

# Create profile
from accounts.models import UserProfile

try:
    profile = user.profile
    print(f'Profile exists for: {user.username}')
except UserProfile.DoesNotExist:
    profile = UserProfile.objects.create(
        user=user,
        role='guardia',
        full_name='Guardia Prueba',
        phone='5512345678',
        numero_empleado='GUARDIA001'
    )
    print(f'Profile created for: {user.username}')

# Verify password works
from django.contrib.auth import authenticate
test_user = authenticate(username='guardia_test', password='Guardia1234!')
if test_user:
    print(f'Password verified OK for: {test_user.username}')
else:
    print('Password verification FAILED')