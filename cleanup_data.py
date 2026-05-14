import os, sys, django
sys.path.insert(0, 'D:/Proyecto RP_LRA/Checklist_Vehicular/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from platform_core.models import RegistroAcceso, Vehiculo
from django.db.models import Q

print("=== LIMPIEZA DE DATOS ANTIGUOS ===")
print()

# Vehículos antiguos que nunca salieron correctamente
vehiculos_antiguos = ['TRAC001', 'TRAC002', 'TRAC003']

print("--- Marcando vehiculos.en_instalacion=False ---")
for placa in vehiculos_antiguos:
    vehiculos = Vehiculo.objects.filter(placa=placa)
    for v in vehiculos:
        if v.en_instalacion:
            print(f"  Vehiculo {v.placa} (ID:{v.id}): en_instalacion=True -> False")
            v.en_instalacion = False
            v.save(update_fields=['en_instalacion'])
        else:
            print(f"  Vehiculo {v.placa} (ID:{v.id}): ya estaba en False")

print()
print("--- Cerrando entradas antiguas (conductor_pendiente_salida=False) ---")

# Cerrar todas las entradas de tracto para esos vehiculos
entradas_cerradas = 0
for placa in vehiculos_antiguos:
    vehiculo = Vehiculo.objects.filter(placa=placa).first()
    if not vehiculo:
        print(f"  Vehiculo {placa}: NO ENCONTRADO")
        continue

    # Entradas de tracto para este vehiculo
    entradas = RegistroAcceso.objects.filter(
        vehiculo=vehiculo,
        tipo_entidad='tracto',
        tipo_movimiento='entrada',
        conductor_pendiente_salida=True
    )
    for e in entradas:
        print(f"  Cerrando entrada ID:{e.id} - Tracto {vehiculo.placa}")
        e.conductor_pendiente_salida = False
        e.save(update_fields=['conductor_pendiente_salida'])
        entradas_cerradas += 1

print(f"\nTotal entradas cerradas: {entradas_cerradas}")

print()
print("--- Verificacion: Pendientes de SALIDA ---")

tractos_pendientes = RegistroAcceso.objects.filter(
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

print(f"Tractos pendientes: {tractos_pendientes.count()}")
for t in tractos_pendientes:
    print(f"  ID:{t.id} | Placa:{t.vehiculo.placa if t.vehiculo else 'N/A'} | Conductor:{t.conductor.nombre_completo if t.conductor else 'N/A'}")