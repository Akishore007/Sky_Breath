#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Create a test user for login testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

# Delete existing test user if it exists
User.objects.filter(username='testuser').delete()

# Create test user
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpassword123',
    first_name='Test',
    last_name='User',
    location='Chennai'
)

# Create auth token
token, created = Token.objects.get_or_create(user=user)

print(f'✓ Test user created successfully!')
print(f'Username: testuser')
print(f'Password: testpassword123')
print(f'Email: test@example.com')
print(f'Auth Token: {token.key}')
