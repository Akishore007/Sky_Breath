#!/usr/bin/env python
"""Get user's selected location"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

try:
    user = User.objects.get(username='kishorepadmapriya')
    print(f"\n{'='*60}")
    print(f"Your Profile Information:")
    print(f"{'='*60}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Selected Location: {user.location}")
    print(f"Language Preference: {user.language_preference}")
    print(f"{'='*60}\n")
except User.DoesNotExist:
    print("User not found!")
