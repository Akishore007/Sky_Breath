#!/usr/bin/env python
"""Test registration endpoint"""

import requests
import json

BASE_URL = "http://localhost:8000"

# Test data
registration_data = {
    "username": "testuser001",
    "email": "testuser001@example.com",
    "password": "TestPassword123",
    "password2": "TestPassword123",
    "first_name": "Test",
    "last_name": "User",
    "location": "Chennai"
}

print("\n" + "=" * 60)
print("🧪 Testing SkyBreath Registration API")
print("=" * 60)

print(f"\n📤 Sending registration request...")
print(f"Endpoint: {BASE_URL}/api/users/register/")
print(f"\nData being sent:")
print(json.dumps(registration_data, indent=2))

try:
    response = requests.post(
        f"{BASE_URL}/api/users/register/",
        json=registration_data,
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    
    print(f"\n" + "=" * 60)
    print(f"Status Code: {response.status_code}")
    print("=" * 60)
    
    print("\n📥 Response:")
    try:
        response_data = response.json()
        print(json.dumps(response_data, indent=2))
    except:
        print(response.text)
    
    if response.status_code == 201:
        print("\n✅ Registration successful!")
    else:
        print("\n❌ Registration failed!")
        if 'error' in response.json():
            print(f"Error: {response.json()['error']}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Cannot connect to backend!")
    print("   Make sure Django server is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
