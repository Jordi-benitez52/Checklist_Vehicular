import os, sys, django
sys.path.insert(0, 'D:/Proyecto RP_LRA/Checklist_Vehicular/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from platform_core.models import RegistroAcceso, Vehiculo, Conductor, Turno
from django.db.models import Q
from django.utils import timezone

print("=== SIMULANDO RESPUESTA API: getPendientesSalida ===")
print()

# Simular lo que devuelve el backend
tractos_pendientes = []
conductores_pendientes = []
empleados_empresa_pendientes = []
empleados_propio_pendientes = []
visitantes_pendientes = []

tractos = RegistroAcceso.objects.filter(
    tipo_entidad='tracto',
    tipo_movimiento='entrada'
).filter(
    Q(conductor_pendiente_salida=True) | Q(vehiculo__en_instalacion=True)
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
).select_related('vehiculo', 'conductor', 'turno')

for r in tractos:
    d = {
        'id': r.id,
        'vehiculo_id': r.vehiculo_id,
        'vehiculo_placa': r.vehiculo.placa if r.vehiculo else None,
        'vehiculo_clave_interna': r.vehiculo.clave_interna if r.vehiculo else None,
        'conductor_id': r.conductor_id,
        'conductor_nombre': r.conductor.nombre_completo if r.conductor else None,
        'fecha_entrada': r.fecha_hora,
        'turno_id': r.turno_id,
        'turno_tipo': r.turno.tipo_turno if r.turno else None,
    }
    tractos_pendientes.append(d)

conductores = RegistroAcceso.objects.filter(
    tipo_entidad='conductor',
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
).select_related('turno')

for r in conductores:
    obs = r.observaciones or ''
    conductor_nombre = None
    conductor_placa = None
    conductor_marca = None
    if '[CONDUCTOR]' in obs:
        parts = obs.replace('[CONDUCTOR]', '').split('|')
        if parts:
            conductor_nombre = parts[0].strip()
        for p in parts:
            if 'Placas:' in p:
                conductor_placa = p.split('Placas:')[1].strip().split('|')[0].strip()
            if 'Marca:' in p:
                conductor_marca = p.split('Marca:')[1].strip()
    d = {
        'id': r.id,
        'conductor_id': r.conductor_id,
        'conductor_nombre': conductor_nombre,
        'conductor_placa': conductor_placa,
        'conductor_marca': conductor_marca,
        'observaciones': obs,
        'fecha_entrada': r.fecha_hora,
    }
    conductores_pendientes.append(d)

print(f"TRACTOS PENDIENTES: {len(tractos_pendientes)}")
for t in tractos_pendientes[:5]:
    print(f"  {t}")

print()
print(f"CONDUCTORES PENDIENTES: {len(conductores_pendientes)}")
for c in conductores_pendientes[:5]:
    print(f"  {c}")

print()
print("=== VERIFICANDO ENTRADA ASOCIADA LOGIC ===")

# Simular lo que pasaría si alguien registra SALIDA para un tracto
print("Simulando SALIDA para tracto ID:61 (TRA-X001 con Roberto)")
entrada = RegistroAcceso.objects.get(id=61)
print(f"  Entrada actual: conductor_pendiente_salida={entrada.conductor_pendiente_salida}")
print(f"  Vehiculo.conductor_actual={entrada.vehiculo.conductor_actual_id}")

# Verificar si la validacion passaría
conductor_id_enviado = entrada.conductor_id  # 14
vehiculo_id_enviado = entrada.vehiculo_id  # 11

existe_entrada = RegistroAcceso.objects.filter(
    vehiculo_id=vehiculo_id_enviado,
    conductor_id=conductor_id_enviado,
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exists()
print(f"  Existe entrada pendiente?: {existe_entrada}")

vehiculo = Vehiculo.objects.get(id=vehiculo_id_enviado)
conductor_correcto = vehiculo.conductor_actual_id == conductor_id_enviado
print(f"  conductor_actual_id ({vehiculo.conductor_actual_id}) == conductor_id ({conductor_id_enviado})?: {conductor_correcto}")