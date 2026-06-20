from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Option A: If your root urls.py DOES NOT have 'api/'
    path('api/signup/', views.signup, name='signup_api'),
    path('api/custom-login/', views.custom_login, name='custom_login_api'), # Fixed for React Axios alignment
    path('api/token/', views.custom_login, name='legacy_custom_login_api'),  # Kept as fallback for old view states
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh_api'),
    path('api/dashboard/', views.dashboard, name='dashboard_api'),
    path('api/google-auth/', views.google_auth, name='google_auth_api'), 
    path('api/save-onboarding/', views.save_onboarding, name='save_onboarding_api'),
    path('api/update-profile/', views.update_profile, name='update_profile_api'), # Added for Profile Mutation Sync
    path('api/log-cardio/', views.log_cardio, name='log_cardio_api'),             # New Cardio Logging Route
    path('api/log-meal/', views.log_meal, name='log_meal_api'),                   # New Meal Logging Route

    # Option B: Backup fallback if your root urls.py ALREADY has 'api/'
    path('signup/', views.signup, name='signup'),
    path('custom-login/', views.custom_login, name='custom_login'),         # Fixed for React Axios alignment
    path('token/', views.custom_login, name='legacy_custom_login'),          # Kept as fallback for old view states
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('google-auth/', views.google_auth, name='google_auth'), 
    path('save-onboarding/', views.save_onboarding, name='save_onboarding'),
    path('update-profile/', views.update_profile, name='update_profile'),         # Added for Backup Profile Mutation Sync
    path('log-cardio/', views.log_cardio, name='log_cardio'),                     # Backup Cardio Logging Route
    path('log-meal/', views.log_meal, name='log_meal'),                           # Backup Meal Logging Route
]
