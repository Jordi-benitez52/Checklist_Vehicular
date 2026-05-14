import os, sys, django
sys.path.insert(0, 'D:/Proyecto RP_LRA/Checklist_Vehicular/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from platform_core.models import Vehiculo, Conductor, RegistroAcceso, Turno
from django.db import transaction
from django.utils import timezone

print("=== CREANDO REGISTROS DE ENTRADA (Tractos con conductor) ===")

# Obtener un turno activo
turno = Turno.objects.filter(abierto=True).first()
if not turno:
    print("NO HAY TURNOS ACTIVOS. Creando uno...")
    from accounts.models import User
    user = User.objects.filter(username='admin').first()
    if not user:
        user = User.objects.first()
    turno = Turno.objects.create(
        tipo_turno='matutino',
        fecha=timezone.now().date(),
        hora_apertura=timezone.now().time(),
        abierto=True,
        guardia=user,
    )
    print(f"CREADO: Turno de prueba ID:{turno.id}")
else:
    print(f"USANDO: Turno activo ID:{turno.id} - {turno.tipo_turno} (Guardia: {turno.guardia})")

print()

# Obtener los conductores y vehiculos recien creados
conductores = Conductor.objects.filter(
    nombre_completo__in=[
        'Roberto Carlos Mendoza Lopez',
        'Francisco Javier Villa Sanchez',
        'Eduardo Gomez Perez'
    ]
)

with transaction.atomic():
    for c in conductores:
        v = c.vehiculo
        if not v:
            print(f"SKIP: Conductor {c.nombre_completo} sin vehiculo")
            continue

        # Verificar si ya existe un registro de entrada pendiente
        existe = RegistroAcceso.objects.filter(
            tipo_entidad='tracto',
            tipo_movimiento='entrada',
            vehiculo=v,
            conductor=c,
            conductor_pendiente_salida=True
        ).exclude(
            id__in=RegistroAcceso.objects.filter(
                tipo_movimiento='salida',
                entrada_asociada__isnull=False
            ).values_list('entrada_asociada_id', flat=True)
        ).exists()

        if existe:
            print(f"YA EXISTE: Registro ENTRADA Tracto para {v.placa} / {c.nombre_completo}")
            continue

        registro = RegistroAcceso.objects.create(
            tipo_entidad='tracto',
            tipo_movimiento='entrada',
            vehiculo=v,
            conductor=c,
            turno=turno,
            guardia=turno.guardia,
            conductor_pendiente_salida=True,
            observaciones=f'Entrada tractocamion de prueba {v.placa} con conductor {c.nombre_completo}',
        )
        print(f"CREADO: Registro ENTRADA Tracto ID:{registro.id} - {v.placa} / {c.nombre_completo}")

print()
print("=== VERIFICACION ===")
print("\nTractos pendientes de salida:")
pendientes = RegistroAcceso.objects.filter(
    tipo_movimiento='entrada',
    conductor_pendiente_salida=True
).exclude(
    id__in=RegistroAcceso.objects.filter(
        tipo_movimiento='salida',
        entrada_asociada__isnull=False
    ).values_list('entrada_asociada_id', flat=True)
)

for p in pendientes:
    cond_nombre = p.conductor.nombre_completo if p.conductor else 'N/A'
    veh_placa = p.vehiculo.placa if p.vehiculo else 'N/A'
    print(f"  ID:{p.id} | Tipo:{p.tipo_entidad} | Conductor:{cond_nombre} | Vehiculo:{veh_placa}")