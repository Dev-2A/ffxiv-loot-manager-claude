from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from bis_manager.views import RegisterView, UserDetailView, LogoutView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('logout/', LogoutView.as_view(), name='logout'),
]