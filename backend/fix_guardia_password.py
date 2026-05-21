import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()
user = User.objects.get(username='guardia_test')

# Reset password
user.password = make_password('Guardia1234!')
user.save()

print(f'Password reset for: {user.username}')

# Verify
from django.contrib.auth import authenticate
test_user = authenticate(username='guardia_test', password='Guardia1234!')
if test_user:
    print(f'Verified OK: {test_user.username}')
else:
    print('Verification FAILED')