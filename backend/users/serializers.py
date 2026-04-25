from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model - used for reading user data
    """
    full_name = serializers.SerializerMethodField()
    favorite_channels = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'first_name',
            'last_name',
            'location',
            'language_preference',
            'temperature_threshold',
            'humidity_threshold',
            'wind_speed_threshold',
            'notifications_enabled',
            'avatar',
            'favorite_channels',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'favorite_channels']
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users with password validation
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            'required': 'Password is required',
            'blank': 'Password cannot be blank',
            'min_length': 'Password must be at least 8 characters long'
        }
    )
    password2 = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            'required': 'Password confirmation is required',
            'blank': 'Password confirmation cannot be blank',
            'min_length': 'Password confirmation must be at least 8 characters'
        }
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'required': 'Email is required',
            'invalid': 'Please enter a valid email address'
        }
    )
    username = serializers.CharField(
        required=True,
        min_length=3,
        error_messages={
            'required': 'Username is required',
            'blank': 'Username cannot be blank',
            'min_length': 'Username must be at least 3 characters long'
        }
    )
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password2',
            'first_name',
            'last_name',
            'location'
        ]
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken')
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered')
        return value
    
    def validate(self, data):
        """Validate password fields match"""
        if data.get('password') != data.get('password2'):
            raise serializers.ValidationError({
                'password': 'Passwords do not match'
            })
        
        # Additional password strength checks
        password = data.get('password', '')
        if password:
            # Check for at least one digit
            if not any(char.isdigit() for char in password):
                raise serializers.ValidationError({
                    'password': 'Password must contain at least one number'
                })
            # Check for at least one uppercase letter
            if not any(char.isupper() for char in password):
                raise serializers.ValidationError({
                    'password': 'Password must contain at least one uppercase letter'
                })
        
        return data
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # This hashes the password automatically
        user.save()
        return user


class UserPreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user preferences (weather thresholds and settings)
    """
    class Meta:
        model = User
        fields = [
            'temperature_threshold',
            'humidity_threshold',
            'wind_speed_threshold',
            'notifications_enabled',
            'location',
            'language_preference'
        ]
    
    def validate_temperature_threshold(self, value):
        """Validate temperature threshold is within reasonable range"""
        if value < 25 or value > 50:
            raise serializers.ValidationError(
                'Temperature threshold must be between 25°C and 50°C'
            )
        return value
    
    def validate_humidity_threshold(self, value):
        """Validate humidity threshold is within reasonable range"""
        if value < 30 or value > 100:
            raise serializers.ValidationError(
                'Humidity threshold must be between 30% and 100%'
            )
        return value
    
    def validate_wind_speed_threshold(self, value):
        """Validate wind speed threshold is within reasonable range"""
        if value < 10 or value > 80:
            raise serializers.ValidationError(
                'Wind speed threshold must be between 10 km/h and 80 km/h'
            )
        return value
