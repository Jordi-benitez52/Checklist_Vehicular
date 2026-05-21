import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

import requests

# Test exactly what the frontend sends
payload = {'username': 'jordijacobmix', 'password': 'Admin1234!'}
print(f'Payload: {payload}')

response = requests.post('http://localhost:8000/api/accounts/login/', json=payload)
print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')