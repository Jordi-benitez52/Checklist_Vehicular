from django.urls import path
from .views import LoginAPIView, RefreshTokenAPIView, TokenVerifyAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('refresh/', RefreshTokenAPIView.as_view(), name='api-refresh'),
    path('token/verify/', TokenVerifyAPIView.as_view(), name='api-token-verify'),
]