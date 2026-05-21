import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

user = User.objects.get(username='guardia_test')
user.email = 'computadorascrew@gmail.com'
user.save()
print(f'Email updated to: {user.email}')

user.profile.verification_code = None
user.profile.verification_code_expires = None
user.profile.verification_attempts = 0
user.profile.verification_locked_until = None
user.profile.save()
print('Verification code reset for new login')