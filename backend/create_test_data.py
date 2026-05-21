import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone

User = get_user_model()

print("=" * 60)
print("CREATING REALISTIC TEST DATA")
print("=" * 60)

# ============================================================
# 1. CREATE 5 DEPARTMENT HEADS (JEFES)
# ============================================================
print("\n[1/5] Creating 5 department heads...")

jefes_data = [
    {"nombre": "Carlos Mendoza Reyes", "numero": "JEFA001", "departamento": "Operaciones"},
    {"nombre": "Maria Gonzalez Lopez", "numero": "JEFA002", "departamento": "Logistica"},
    {"nombre": "Roberto Hernandez Torres", "numero": "JEFA003", "departamento": "Almacen"},
    {"nombre": "Ana Lopez Martinez", "numero": "JEFA004", "departamento": "Seguridad"},
    {"nombre": "Luis Ramirez Sanchez", "numero": "JEFA005", "departamento": "Mantenimiento"},
]

jefes = []
for i, data in enumerate(jefes_data):
    try:
        user = User.objects.get(username=data["numero"].lower())
        print(f"  - Jefe {data['nombre']} already exists")
        jefes.append(user)
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=data["numero"].lower(),
            email=f"{data['numero'].lower()}@lra.com",
            password=make_password('Jefe1234!')
        )
        from accounts.models import UserProfile
        UserProfile.objects.create(
            user=user,
            role='admin',
            full_name=data["nombre"],
            numero_empleado=data["numero"],
            phone=f"551000{1000+i}",
            is_active_user=True
        )
        print(f"  + Jefe created: {data['nombre']} ({data['numero']})")
        jefes.append(user)

# ============================================================
# 2. CREATE 12 EMPLOYEES WITH OWN VEHICLES
# ============================================================
print("\n[2/5] Creating 12 employees with own vehicles...")

empleados_data = [
    {"nombre": "Pedro Sanchez Garcia", "numero": "EMP001", "marca": "Nissan", "modelo": "Sentra", "year": "2022", "placa": "ABC-1234", "color": "Gris", "categoria": "automovil"},
    {"nombre": "Laura Martinez Cruz", "numero": "EMP002", "marca": "Volkswagen", "modelo": "Jetta", "year": "2021", "placa": "DEF-5678", "color": "Blanco", "categoria": "automovil"},
    {"nombre": "Jorge Ruiz Diaz", "numero": "EMP003", "marca": "Chevrolet", "modelo": "Spark", "year": "2020", "placa": "GHI-9012", "color": "Rojo", "categoria": "automovil"},
    {"nombre": "Sofia Torres Vega", "numero": "EMP004", "marca": "Ford", "modelo": "Mustang", "year": "2023", "placa": "JKL-3456", "color": "Azul", "categoria": "automovil"},
    {"nombre": "Miguel Angel Castro", "numero": "EMP005", "marca": "Toyota", "modelo": "Corolla", "year": "2019", "placa": "MNO-7890", "color": "Negro", "categoria": "automovil"},
    {"nombre": "Patricia Flores Morales", "numero": "EMP006", "marca": "Honda", "modelo": "Civic", "year": "2022", "placa": "PQR-1111", "color": "Plata", "categoria": "automovil"},
    {"nombre": "Fernando Rivera Luna", "numero": "EMP007", "marca": "Mazda", "modelo": "3", "year": "2021", "placa": "STU-2222", "color": "Rojo", "categoria": "automovil"},
    {"nombre": "Claudia Mendoza Ortiz", "numero": "EMP008", "marca": "Kia", "modelo": "Forte", "year": "2020", "placa": "VWX-3333", "color": "Gris", "categoria": "automovil"},
    {"nombre": "Ricardo Orozco Delgado", "numero": "EMP009", "marca": "Hyundai", "modelo": "Elantra", "year": "2023", "placa": "YZA-4444", "color": "Blanco", "categoria": "automovil"},
    {"nombre": "Gabriela Vargas Rios", "numero": "EMP010", "marca": "Nissan", "modelo": "Versa", "year": "2021", "placa": "BCD-5555", "color": "Azul", "categoria": "automovil"},
    {"nombre": "Alberto Diaz Castillo", "numero": "EMP011", "marca": "Volkswagen", "modelo": "Golf", "year": "2022", "placa": "EFG-6666", "color": "Negro", "categoria": "automovil"},
    {"nombre": "Rosa Maria Herrera", "numero": "EMP012", "marca": "Chevrolet", "modelo": "Cruze", "year": "2020", "placa": "HIJ-7777", "color": "Rojo", "categoria": "automovil"},
]

empleados = []
from platform_core.models import Vehiculo

for idx, data in enumerate(empleados_data):
    try:
        user = User.objects.get(username=data["numero"].lower())
        print(f"  - Employee {data['nombre']} already exists (user exists)")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=data["numero"].lower(),
            email=f"{data['numero'].lower()}@lra.com",
            password=make_password('Empleado123!')
        )
        from accounts.models import UserProfile
        UserProfile.objects.create(
            user=user,
            role='empleado',
            full_name=data["nombre"],
            numero_empleado=data["numero"],
            phone=f"551111{1000+idx}",
            is_active_user=True
        )
        print(f"  + Employee user created: {data['nombre']}")

    try:
        vehiculo = Vehiculo.objects.get(clave_interna=data["numero"])
        print(f"  - Vehicle {data['placa']} already exists")
    except Vehiculo.DoesNotExist:
        vehiculo = Vehiculo.objects.create(
            tipo_entidad='empleado',
            placa=data["placa"],
            marca=data["marca"],
            modelo=data["modelo"],
            color=data["color"],
            clave_interna=data["numero"],
            categoria=data["categoria"],
            en_instalacion=False,
            activo=True
        )
        print(f"  + Vehicle created: {data['marca']} {data['modelo']} ({data['placa']})")

    empleados.append(user)

# ============================================================
# 3. CREATE 10 TRACTOCAMIONES (T-01 to T-10)
# ============================================================
print("\n[3/5] Creating 10 tractocamiones (T-01 to T-10)...")

tractocamiones_data = [
    {"clave": "T-01", "marca": "Kenworth", "modelo": "T680", "placa": "TR-0001-A"},
    {"clave": "T-02", "marca": "Peterbilt", "modelo": "579", "placa": "TR-0002-A"},
    {"clave": "T-03", "marca": "Freightliner", "modelo": "Cascadia", "placa": "TR-0003-A"},
    {"clave": "T-04", "marca": "Volvo", "modelo": "VNL 860", "placa": "TR-0004-A"},
    {"clave": "T-05", "marca": "International", "modelo": "LT", "placa": "TR-0005-A"},
    {"clave": "T-06", "marca": "Mack", "modelo": "Anthem", "placa": "TR-0006-A"},
    {"clave": "T-07", "marca": "Kenworth", "modelo": "W990", "placa": "TR-0007-A"},
    {"clave": "T-08", "marca": "Peterbilt", "modelo": "389", "placa": "TR-0008-A"},
    {"clave": "T-09", "marca": "Freightliner", "modelo": "Columbia", "placa": "TR-0009-A"},
    {"clave": "T-10", "marca": "Volvo", "modelo": "VNL 760", "placa": "TR-0010-A"},
]

tractos = []
for data in tractocamiones_data:
    try:
        vehiculo = Vehiculo.objects.get(clave_interna=data["clave"])
        print(f"  - Tractocamion {data['clave']} already exists")
        tractos.append(vehiculo)
    except Vehiculo.DoesNotExist:
        vehiculo = Vehiculo.objects.create(
            tipo_entidad='tracto',
            placa=data["placa"],
            marca=data["marca"],
            modelo=data["modelo"],
            clave_interna=data["clave"],
            color="Blanco",
            categoria='tractocamion',
            en_instalacion=False,
            activo=True
        )
        print(f"  + Tractocamion created: {data['clave']} - {data['marca']} {data['modelo']} ({data['placa']})")
        tractos.append(vehiculo)

# ============================================================
# 4. CREATE 10 CONDUCTORS AND ASSIGN TO TRACTOCAMIONES
# ============================================================
print("\n[4/5] Creating 10 conductors and assigning to tractocamiones...")

conductores_data = [
    {"nombre": "Jose Luis Morales", "licencia": "DL-100001", "telefono": "5510001001"},
    {"nombre": "Juan Carlos Rojas", "licencia": "DL-100002", "telefono": "5510001002"},
    {"nombre": "Raul Gutierrez Perez", "licencia": "DL-100003", "telefono": "5510001003"},
    {"nombre": "Francisco Javier Luna", "licencia": "DL-100004", "telefono": "5510001004"},
    {"nombre": "Victor Hugo Diaz", "licencia": "DL-100005", "telefono": "5510001005"},
    {"nombre": "Antonio Hernandez Soto", "licencia": "DL-100006", "telefono": "5510001006"},
    {"nombre": "Jesus Maria Torres", "licencia": "DL-100007", "telefono": "5510001007"},
    {"nombre": "Daniel Garcia Vega", "licencia": "DL-100008", "telefono": "5510001008"},
    {"nombre": "Eduardo Rodriguez", "licencia": "DL-100009", "telefono": "5510001009"},
    {"nombre": "Oscar Sanchez Cruz", "licencia": "DL-100010", "telefono": "5510001010"},
]

from platform_core.models import Conductor, AsignacionConductorVehiculo

for i, data in enumerate(conductores_data):
    try:
        conductor = Conductor.objects.get(nombre_completo=data["nombre"])
        print(f"  - Conductor {data['nombre']} already exists")
    except Conductor.DoesNotExist:
        conductor = Conductor.objects.create(
            nombre_completo=data["nombre"],
            telefono=data["telefono"],
            licencia=data["licencia"],
            activo=True
        )
        print(f"  + Conductor created: {data['nombre']}")

    tracto = tractos[i]
    try:
        existing = AsignacionConductorVehiculo.objects.filter(
            vehiculo=tracto,
            conductor=conductor,
            activa=True
        ).exists()
        if not existing:
            AsignacionConductorVehiculo.objects.create(
                vehiculo=tracto,
                conductor=conductor,
                activa=True,
                fecha_asignacion=timezone.now()
            )
            print(f"    -> Assigned to {tracto.clave_interna}")
        else:
            print(f"    -> Already assigned to {tracto.clave_interna}")
    except Exception as e:
        print(f"    -> Assignment error: {e}")

# ============================================================
# 5. CREATE 3 ADDITIONAL TEST GUARDS
# ============================================================
print("\n[5/5] Creating 3 additional test guards...")

guardias_data = [
    {"nombre": "Guardia Prueba 1", "username": "guardia_uno", "telefono": "5519990001"},
    {"nombre": "Guardia Prueba 2", "username": "guardia_dos", "telefono": "5519990002"},
    {"nombre": "Guardia Prueba 3", "username": "guardia_tres", "telefono": "5519990003"},
]

for idx, data in enumerate(guardias_data):
    try:
        user = User.objects.get(username=data["username"])
        print(f"  - Guard {data['username']} already exists")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=data["username"],
            email=f"{data['username']}@demo.com",
            password=make_password('Guardia1234!')
        )
        from accounts.models import UserProfile
        UserProfile.objects.create(
            user=user,
            role='guardia',
            full_name=data["nombre"],
            phone=data["telefono"],
            numero_empleado=f"GUARD{1000+idx}",
            is_active_user=True
        )
        print(f"  + Guard created: {data['username']}")

print("\n" + "=" * 60)
print("TEST DATA CREATION COMPLETE")
print("=" * 60)
print("\nSummary:")
print("  - 5 department heads (JEFA001-JEFA005)")
print("  - 12 employees with own vehicles (EMP001-EMP012)")
print("  - 10 tractocamiones (T-01 to T-10)")
print("  - 10 conductors assigned to tractocamiones")
print("  - 3 additional test guards")
print("\nLogin credentials:")
print("  - Jefes: JEFA001 / Jefe1234!")
print("  - Empleados: EMP001 / Empleado123!")
print("  - Guardias: guardia_uno / Guardia1234!")