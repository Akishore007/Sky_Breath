#!/usr/bin/env python
"""
User Management Script for SkyBreath
Helps create, reset, or list user accounts
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'weatherhub.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def create_user(username, email, password):
    """Create a new user"""
    print(f"\n🔧 Creating user: {username}")
    try:
        if User.objects.filter(username=username).exists():
            print(f"❌ User '{username}' already exists!")
            return False
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=username.split('.')[0].capitalize() if '.' in username else username.capitalize(),
            location='Chennai'
        )
        
        # Create token
        token, created = Token.objects.get_or_create(user=user)
        
        print(f"✅ User created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Token: {token.key}")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def reset_password(username, new_password):
    """Reset user password"""
    print(f"\n🔧 Resetting password for: {username}")
    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        print(f"✅ Password reset successfully!")
        return True
    except User.DoesNotExist:
        print(f"❌ User '{username}' not found!")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def list_users():
    """List all users"""
    print(f"\n📋 Registered Users:")
    print("=" * 50)
    users = User.objects.all()
    if not users.exists():
        print("No users found.")
        return
    
    for user in users:
        token = Token.objects.filter(user=user).first()
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Created: {user.date_joined}")
        print(f"Token: {token.key if token else 'No token'}")
        print("-" * 50)

def delete_user(username):
    """Delete a user"""
    print(f"\n🗑️  Deleting user: {username}")
    try:
        user = User.objects.get(username=username)
        user.delete()
        print(f"✅ User deleted successfully!")
        return True
    except User.DoesNotExist:
        print(f"❌ User '{username}' not found!")
        return False

def main():
    """Main menu"""
    while True:
        print("\n" + "=" * 50)
        print("🌍 SkyBreath User Management")
        print("=" * 50)
        print("1. Create new user")
        print("2. Reset user password")
        print("3. List all users")
        print("4. Delete user")
        print("5. Exit")
        print("=" * 50)
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == '1':
            username = input("Enter username: ").strip()
            email = input("Enter email: ").strip()
            password = input("Enter password: ").strip()
            create_user(username, email, password)
            
        elif choice == '2':
            username = input("Enter username: ").strip()
            password = input("Enter new password: ").strip()
            reset_password(username, password)
            
        elif choice == '3':
            list_users()
            
        elif choice == '4':
            username = input("Enter username to delete: ").strip()
            confirm = input(f"Are you sure? (yes/no): ").strip().lower()
            if confirm == 'yes':
                delete_user(username)
            
        elif choice == '5':
            print("\n👋 Goodbye!")
            break
        else:
            print("\n❌ Invalid option!")

if __name__ == '__main__':
    main()
