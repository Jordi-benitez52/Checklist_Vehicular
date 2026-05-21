"""
Script para poblar el catálogo de items del checklist tractocamión.
Ejecutar con: python manage.py shell < platform_core/seed_checklist_items.py
"""

from platform_core.models import ChecklistTractoItemCatalogo

items_data = [
    # COMBUSTIBLE - tipo nivel
    {'codigo': 'comb_001', 'seccion': 'combustible', 'nombre': 'Nivel de combustible', 'orden': 1, 'tipo_respuesta': 'nivel'},

    # ACEITE - tipo nivel
    {'codigo': 'aceite_001', 'seccion': 'aceite', 'nombre': 'Nivel de aceite', 'orden': 1, 'tipo_respuesta': 'nivel'},

    # ACCESORIOS - tipo binario (OK/Falla/N/A)
    {'codigo': 'acc_001', 'seccion': 'accesorios', 'nombre': 'Botiquín', 'orden': 1, 'tipo_respuesta': 'binario'},
    {'codigo': 'acc_002', 'seccion': 'accesorios', 'nombre': 'Conos', 'orden': 2, 'tipo_respuesta': 'binario'},
    {'codigo': 'acc_003', 'seccion': 'accesorios', 'nombre': 'Extintor', 'orden': 3, 'tipo_respuesta': 'binario'},
    {'codigo': 'acc_004', 'seccion': 'accesorios', 'nombre': 'Matraca', 'orden': 4, 'tipo_respuesta': 'binario'},
    {'codigo': 'acc_005', 'seccion': 'accesorios', 'nombre': 'Gato hidráulico', 'orden': 5, 'tipo_respuesta': 'binario'},
    {'codigo': 'acc_006', 'seccion': 'accesorios', 'nombre': 'Cable paso corriente', 'orden': 6, 'tipo_respuesta': 'binario'},

    # VENTANAS - tipo booleano (Bueno/Malo)
    {'codigo': 'vent_001', 'seccion': 'ventanas', 'nombre': 'Ventana lateral izq.', 'orden': 1, 'tipo_respuesta': 'booleano'},
    {'codigo': 'vent_002', 'seccion': 'ventanas', 'nombre': 'Ventana lateral der.', 'orden': 2, 'tipo_respuesta': 'booleano'},
    {'codigo': 'vent_003', 'seccion': 'ventanas', 'nombre': 'Parabrisas', 'orden': 3, 'tipo_respuesta': 'booleano'},

    # ESPEJOS - tipo booleano (Bueno/Malo)
    {'codigo': 'esp_001', 'seccion': 'espejos', 'nombre': 'Espejo lateral izq.', 'orden': 1, 'tipo_respuesta': 'booleano'},
    {'codigo': 'esp_002', 'seccion': 'espejos', 'nombre': 'Espejo lateral der.', 'orden': 2, 'tipo_respuesta': 'booleano'},
    {'codigo': 'esp_003', 'seccion': 'espejos', 'nombre': 'Espejos convexos', 'orden': 3, 'tipo_respuesta': 'booleano'},

    # LUCES - tipo binario (OK/Falla/N/A)
    {'codigo': 'luc_001', 'seccion': 'luces', 'nombre': 'Luces bajas', 'orden': 1, 'tipo_respuesta': 'binario'},
    {'codigo': 'luc_002', 'seccion': 'luces', 'nombre': 'Luces altas', 'orden': 2, 'tipo_respuesta': 'binario'},
    {'codigo': 'luc_003', 'seccion': 'luces', 'nombre': 'Intermitentes', 'orden': 3, 'tipo_respuesta': 'binario'},
    {'codigo': 'luc_004', 'seccion': 'luces', 'nombre': 'Luz de freno', 'orden': 4, 'tipo_respuesta': 'binario'},
    {'codigo': 'luc_005', 'seccion': 'luces', 'nombre': 'Luz de retroceso', 'orden': 5, 'tipo_respuesta': 'binario'},

    # HABITÁCULO - tipo binario (OK/Falla/N/A)
    {'codigo': 'hab_001', 'seccion': 'habitaculo', 'nombre': 'Asiento conductor', 'orden': 1, 'tipo_respuesta': 'binario'},
    {'codigo': 'hab_002', 'seccion': 'habitaculo', 'nombre': 'Cinturón de seguridad', 'orden': 2, 'tipo_respuesta': 'binario'},
    {'codigo': 'hab_003', 'seccion': 'habitaculo', 'nombre': 'Limpia parabrisas', 'orden': 3, 'tipo_respuesta': 'binario'},
    {'codigo': 'hab_004', 'seccion': 'habitaculo', 'nombre': 'Claxon', 'orden': 4, 'tipo_respuesta': 'binario'},

    # MOTOR Y CHASIS - tipo binario (OK/Falla/N/A)
    {'codigo': 'mot_001', 'seccion': 'motor_y_chasis', 'nombre': 'Motor', 'orden': 1, 'tipo_respuesta': 'binario'},
    {'codigo': 'mot_002', 'seccion': 'motor_y_chasis', 'nombre': 'Suspensión', 'orden': 2, 'tipo_respuesta': 'binario'},
    {'codigo': 'mot_003', 'seccion': 'motor_y_chasis', 'nombre': 'Dirección', 'orden': 3, 'tipo_respuesta': 'binario'},
    {'codigo': 'mot_004', 'seccion': 'motor_y_chasis', 'nombre': 'Escape', 'orden': 4, 'tipo_respuesta': 'binario'},

    # SEGURIDAD - tipo binario (OK/Falla/N/A)
    {'codigo': 'seg_001', 'seccion': 'seguridad', 'nombre': 'Chasis', 'orden': 1, 'tipo_respuesta': 'binario'},
    {'codigo': 'seg_002', 'seccion': 'seguridad', 'nombre': 'Piso', 'orden': 2, 'tipo_respuesta': 'binario'},
    {'codigo': 'seg_003', 'seccion': 'seguridad', 'nombre': 'Puntales', 'orden': 3, 'tipo_respuesta': 'binario'},
    {'codigo': 'seg_004', 'seccion': 'seguridad', 'nombre': 'Cadenas de seguridad', 'orden': 4, 'tipo_respuesta': 'binario'},
]

created_count = 0
updated_count = 0

for item_data in items_data:
    item, created = ChecklistTractoItemCatalogo.objects.update_or_create(
        codigo=item_data['codigo'],
        defaults=item_data
    )
    if created:
        created_count += 1
        print(f"✓ Creado: {item}")
    else:
        updated_count += 1
        print(f"↻ Actualizado: {item}")

print(f"\nTotal: {created_count} creados, {updated_count} actualizados")