from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    
    # Updated to run our strict manual form authentication logic view
    path('token/', views.custom_login, name='custom_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('dashboard/', views.dashboard, name='dashboard'),
    path('google-auth/', views.google_auth, name='google-auth'), 
]
