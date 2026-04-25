#!/usr/bin/env python
"""Check existing users in SkyBreath database"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

print("\n" + "=" * 60)
print("📋 SkyBreath Registered Users")
print("=" * 60)

users = User.objects.all()

if not users.exists():
    print("\n❌ No users found in database!")
    print("\nYour account signup data was not saved.")
    print("Let's create a new account...\n")
    sys.exit(0)

print(f"\n✅ Found {users.count()} user(s):\n")

for user in users:
    token = Token.objects.filter(user=user).first()
    print(f"👤 Username:    {user.username}")
    print(f"📧 Email:       {user.email}")
    print(f"📅 Joined:      {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔑 Auth Token:  {token.key if token else '❌ No token'}")
    print("-" * 60)

print("\n💡 If your username is in the list but login fails:")
print("   → Your password might be incorrect")
print("   → You can reset it using the management script")
print("\nIf your username is NOT in the list:")
print("   → Your signup data was not saved")
print("   → Create a new account")
