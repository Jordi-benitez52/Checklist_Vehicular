from django.urls import path
from .views import (
    LoginAPIView,
    MeAPIView,
    MeUpdateAPIView,
    UsuarioGuardiaListAPIView,
    UsuarioGuardiaCreateAPIView,
    UsuarioGuardiaDetailAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='accounts-login'),
    path('me/', MeAPIView.as_view(), name='accounts-me'),
    path('me/editar/', MeUpdateAPIView.as_view(), name='accounts-me-editar'),
    path('usuarios/', UsuarioGuardiaListAPIView.as_view(), name='accounts-usuarios'),
    path('usuarios/crear/', UsuarioGuardiaCreateAPIView.as_view(), name='accounts-usuarios-crear'),
    path('usuarios/<int:pk>/', UsuarioGuardiaDetailAPIView.as_view(), name='accounts-usuarios-detail'),
]