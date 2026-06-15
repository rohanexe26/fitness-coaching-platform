from django.contrib import admin
from django.urls import path, include 

urlpatterns = [
    path('admin/', admin.site.urls),
    # This captures any 'api/...' path and sends it to your accounts app
    path('api/', include('accounts.urls')), 
]
