from django.db import models
from django.contrib.auth.models import User


class RegistroVehicular(models.Model):
    TIPO_MOVIMIENTO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO_CHOICES)
    nombre_conductor = models.CharField(max_length=150)
    placa = models.CharField(max_length=20)
    vehiculo = models.CharField(max_length=100)
    observaciones = models.TextField(blank=True, null=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    registrado_por = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='registros_vehiculares'
    )

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Registro Vehicular'
        verbose_name_plural = 'Registros Vehiculares'

    def __str__(self):
        return f"{self.tipo_movimiento.upper()} - {self.placa} - {self.nombre_conductor}"