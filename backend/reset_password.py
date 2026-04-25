#!/usr/bin/env python
"""Reset user password for SkyBreath"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Reset password for kishorepadmapriya
username = "kishorepadmapriya"
new_password = "skybreath123"  # Change this to your desired password

try:
    user = User.objects.get(username=username)
    user.set_password(new_password)
    user.save()
    print(f"\n✅ Password reset successfully!")
    print(f"   Username: {username}")
    print(f"   New Password: {new_password}")
    print(f"\n   Try logging in with these credentials now.")
except User.DoesNotExist:
    print(f"❌ User '{username}' not found!")
