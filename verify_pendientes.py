import os, sys, django
sys.path.insert(0, 'D:/Proyecto RP_LRA/Checklist_Vehicular/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from platform_core.models import RegistroAcceso
from django.db.models import Q

print("=== VERIFICACION: Pendientes SALIDA ===")
print()

print("--- TRACTOS PENDIENTES ---")
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
)

for r in tractos:
    print(f"  ID:{r.id} | Placa:{r.vehiculo.placa if r.vehiculo else 'N/A'} | Conductor:{r.conductor.nombre_completo if r.conductor else 'N/A'} (ID:{r.conductor_id})")

print()
print("--- CONDUCTORES PENDIENTES ---")
conductores = RegistroAcceso.objects.filter(
    tipo_entidad='conductor',
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
)

for r in conductores:
    obs = r.observaciones or ''
    print(f"  ID:{r.id} | Obs:{obs[:60]}...")

print()
print("--- EMPLEADOS EMPRESA PENDIENTES ---")
emp_emp = RegistroAcceso.objects.filter(
    tipo_entidad='empleado',
    tipo_movimiento='entrada',
    vehiculo__isnull=False
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
)

for r in emp_emp:
    print(f"  ID:{r.id} | Empleado:{r.empleado.nombre_completo if r.empleado else 'N/A'} | Vehiculo:{r.vehiculo.placa if r.vehiculo else 'N/A'}")

print()
print("--- EMPLEADOS PROPIO PENDIENTES ---")
emp_propio = RegistroAcceso.objects.filter(
    tipo_entidad='empleado_propio',
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
)

for r in emp_propio:
    print(f"  ID:{r.id} | Obs:{r.observaciones[:50] if r.observaciones else 'N/A'}")

print()
print("--- VISITANTES PENDIENTES ---")
visitantes = RegistroAcceso.objects.filter(
    tipo_entidad='visitante',
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
)

for r in visitantes:
    print(f"  ID:{r.id} | Obs:{r.observaciones[:50] if r.observaciones else 'N/A'}")