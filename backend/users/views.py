from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db import IntegrityError
from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserPreferencesSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management and authentication
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action == 'update_preferences':
            return UserPreferencesSerializer
        return UserSerializer
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """
        Register a new user with comprehensive validation
        
        Expected fields:
        - username (str): unique username
        - email (str): unique email address
        - password (str): password (min 8 chars)
        - password2 (str): password confirmation
        - first_name (str, optional)
        - last_name (str, optional)
        - location (str, optional)
        """
        # Input validation
        if not request.data.get('email'):
            return Response(
                {'email': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.data.get('password'):
            return Response(
                {'password': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check password strength
        if len(request.data.get('password', '')) < 8:
            return Response(
                {'password': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate with serializer
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                token, created = Token.objects.get_or_create(user=user)
                
                response_data = {
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'message': 'User registered successfully'
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            except IntegrityError as e:
                # Handle unique constraint violations
                if 'email' in str(e):
                    return Response(
                        {'email': 'This email is already registered'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif 'username' in str(e):
                    return Response(
                        {'username': 'This username is already taken'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {'error': 'Registration failed: duplicate entry'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        Authenticate user and return token
        
        Expected fields:
        - username (str): username or email
        - password (str): password
        
        Returns:
        - user: user object with all fields
        - token: authentication token for API requests
        """
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        # Validate inputs
        if not username_or_email:
            return Response(
                {'username': 'Email or username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not password:
            return Response(
                {'password': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to authenticate with username first
        user = authenticate(username=username_or_email, password=password)
        
        # If not found, try to find user by email and authenticate
        if user is None:
            if '@' in username_or_email:
                try:
                    user_obj = User.objects.get(email=username_or_email)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        """Logout user by deleting token"""
        try:
            request.user.auth_token.delete()
            return Response({'message': 'Successfully logged out'})
        except Exception as e:
            return Response(
                {'message': 'Logout completed'},
                status=status.HTTP_200_OK
            )
    
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_preferences(self, request, pk=None):
        """Update user weather preferences"""
        user = self.get_object()
        
        # Check permission - allow users to update only their own preferences
        if user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only update your own preferences'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserPreferencesSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Preferences updated successfully'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get user profile"""
        user = self.get_object()
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_account(self, request):
        """Delete current user account"""
        user = request.user
        try:
            user.delete()
            return Response(
                {'message': 'Account successfully deleted'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete account: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )