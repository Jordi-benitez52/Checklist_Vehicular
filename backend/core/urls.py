from django.urls import path
from .views import registrar_movimiento, movimientos_recientes

urlpatterns = [
    path('registrar-movimiento/', registrar_movimiento, name='registrar-movimiento'),
    path('movimientos-recientes/', movimientos_recientes, name='movimientos-recientes'),
]