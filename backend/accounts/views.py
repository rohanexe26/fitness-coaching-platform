from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests

# Helper function to assign a user to a group safely
def assign_user_role(user, role_name):
    group, created = Group.objects.get_or_create(name=role_name)
    user.groups.clear()  # Prevents role bleeding
    user.groups.add(group)

# Helper function to check group membership
def has_user_role(user, role_name):
    return user.groups.filter(name=role_name).exists()


# 1. FIXED STANDARD USER SIGNUP (Manual Form)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role', 'user') # 'user' or 'trainer'

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    assign_user_role(user, role) # Locks role right into DB groups
    
    return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)


# 2. NEW MANUALLY CONTROLLED LOGIN ENDPOINT (With Strict Role Matching)
@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    selected_role = request.data.get('role', 'user') # 'user' or 'trainer'

    user = authenticate(username=username, password=password)

    if user is not None:
        # AUTOMATIC DATABASE BACKFILL: If an old user has no group yet, assign their current choice
        if not user.groups.exists():
            assign_user_role(user, selected_role)

        # STRICT ROLE VERIFICATION CHECK
        if not has_user_role(user, selected_role):
            expected_role = "Trainer" if has_user_role(user, "trainer") else "Member"
            return Response({
                'error': f'Access Denied. Account is registered as a {expected_role}.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Generate custom JWT response payloads
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)
        
    return Response({'error': 'Invalid Username or Password'}, status=status.HTTP_401_UNAUTHORIZED)


# 3. PROTECTED PROFILE DASHBOARD DATA
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    user = request.user
    role_string = "Trainer" if user.groups.filter(name="trainer").exists() else "Member"
    
    return Response({
        'username': user.username,
        'email': user.email,
        'role': role_string,
        'message': f"Welcome back to FitTrack, {user.username}!"
    })


# 4. GOOGLE AUTHENTICATION (With Strict Role Verification)
@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    token = request.data.get('token')
    selected_role = request.data.get('role', 'user') 
    chosen_username = request.data.get('username') 

    if not token:
        return Response({'error': 'Token is missing'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), clock_skew_in_seconds=10)
        email = idinfo['email']

        user_exists = User.objects.filter(email=email).first()

        if user_exists:
            # AUTOMATIC DATABASE BACKFILL: If an old Google user has no group yet, assign their selection
            if not user_exists.groups.exists():
                assign_user_role(user_exists, selected_role)

            # STRICT CHECK: Ensure database group matches screen toggle switch selection
            if not has_user_role(user_exists, selected_role):
                expected_role = "Trainer" if has_user_role(user_exists, "trainer") else "Member"
                return Response({
                    'error': f'Access Denied. Account is registered as a {expected_role}.'
                }, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user_exists)
            return Response({
                'action': 'login',
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)

        if not chosen_username:
            return Response({
                'action': 'require_username',
                'message': 'This email is new. Please select a custom username.'
            }, status=status.HTTP_200_OK)

        chosen_username = chosen_username.strip().lower()
        if User.objects.filter(username=chosen_username).exists():
            return Response({'error': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST)

        new_user = User.objects.create_user(
            username=chosen_username,
            email=email,
            first_name=idinfo.get('given_name', ''),
            last_name=idinfo.get('family_name', '')
        )
        assign_user_role(new_user, selected_role)

        refresh = RefreshToken.for_user(new_user)
        return Response({
            'action': 'signup',
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)

    except ValueError:
        return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
