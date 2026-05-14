import os, sys, django
sys.path.insert(0, 'D:/Proyecto RP_LRA/Checklist_Vehicular/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from platform_core.models import RegistroAcceso

print('=== TODOS LOS REGISTROS ENTRADA (ultimos 30) ===')
registros = RegistroAcceso.objects.filter(tipo_movimiento='entrada').order_by('-fecha_hora')[:30]
for r in registros:
    obs = r.observaciones[:50] if r.observaciones else None
    print(f"ID:{r.id} | tipo:{r.tipo_entidad} | Pendiente:{r.conductor_pendiente_salida} | Obs:{obs}")

print()
print('=== COUNT POR TIPO_ENTIDAD ===')
from django.db.models import Count
counts = RegistroAcceso.objects.filter(tipo_movimiento='entrada').values('tipo_entidad').annotate(cnt=Count('id'))
for c in counts:
    print(f"  {c['tipo_entidad']}: {c['cnt']}")