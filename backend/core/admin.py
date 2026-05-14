from django.contrib import admin
from .models import RegistroVehicular


@admin.register(RegistroVehicular)
class RegistroVehicularAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'tipo_movimiento',
        'nombre_conductor',
        'placa',
        'vehiculo',
        'fecha_hora',
        'registrado_por'
    )
    list_filter = ('tipo_movimiento', 'fecha_hora')
    search_fields = ('nombre_conductor', 'placa', 'vehiculo')