from django.contrib import admin

try:
    from accounts.models import UserProfile
except ImportError:
    from .models import UserProfile

from .models import (
    Turno,
    Empleado,
    Conductor,
    Vehiculo,
    AsignacionVehiculoEmpleado,
    VisitanteRegistro,
    PlantillaChecklist,
    PlantillaChecklistItem,
    RegistroAcceso,
    ChecklistRegistro,
    ChecklistItemResultado,
    Evidencia,
    AuditoriaEvento,
    ChecklistTracto,
    ChecklistTractoItemCatalogo,
    ChecklistTractoResultado,
    ChecklistTractoLlanta,
    ChecklistTractoEvidencia,
    AuditLog,
)




@admin.register(Turno)
class TurnoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'guardia',
        'tipo_turno',
        'fecha',
        'hora_apertura',
        'hora_cierre',
        'abierto',
    )
    list_filter = ('tipo_turno', 'abierto', 'fecha')
    search_fields = ('guardia_username', 'guardia_email', 'observaciones')
    ordering = ('-fecha', '-hora_apertura')
    autocomplete_fields = ('guardia',)


@admin.register(Empleado)
class EmpleadoAdmin(admin.ModelAdmin):
    list_display = (
        'numero_empleado',
        'nombre_completo',
        'departamento',
        'puesto',
        'activo',
    )
    list_filter = ('activo', 'departamento')
    search_fields = (
        'numero_empleado',
        'nombre_completo',
        'departamento',
        'puesto',
    )
    ordering = ('nombre_completo',)


@admin.register(Conductor)
class ConductorAdmin(admin.ModelAdmin):
    list_display = (
        'nombre_completo',
        'licencia',
        'vehiculo',
        'empresa',
        'activo',
    )
    list_filter = ('activo', 'empresa', 'vehiculo')
    search_fields = (
        'nombre_completo',
        'licencia',
        'telefono',
        'empresa',
    )
    list_select_related = ('vehiculo',)
    ordering = ('nombre_completo',)


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = (
        'placa',
        'tipo_entidad',
        'categoria',
        'marca',
        'modelo',
        'color',
        'empresa',
        'activo',
        'requiere_checklist',
    )
    list_filter = (
        'tipo_entidad',
        'categoria',
        'activo',
        'requiere_checklist',
        'empresa',
    )
    search_fields = (
        'placa',
        'clave_interna',
        'propietario',
        'empresa',
        'marca',
        'modelo',
        'numero_economico',
    )
    ordering = ('placa',)


@admin.register(AsignacionVehiculoEmpleado)
class AsignacionVehiculoEmpleadoAdmin(admin.ModelAdmin):
    list_display = (
        'vehiculo',
        'empleado',
        'activa',
        'fecha_asignacion',
    )
    list_filter = ('activa', 'fecha_asignacion')
    search_fields = (
        'vehiculo__placa',
        'empleado__nombre_completo',
        'empleado__numero_empleado',
    )
    ordering = ('-fecha_asignacion',)
    autocomplete_fields = ('vehiculo', 'empleado')


@admin.register(VisitanteRegistro)
class VisitanteRegistroAdmin(admin.ModelAdmin):
    list_display = (
        'nombre_completo',
        'tipo_visitante',
        'empresa',
        'placas',
        'motivo',
    )
    list_filter = ('tipo_visitante', 'empresa')
    search_fields = (
        'nombre_completo',
        'empresa',
        'placas',
        'motivo',
    )
    ordering = ('nombre_completo',)


class PlantillaChecklistItemInline(admin.TabularInline):
    model = PlantillaChecklistItem
    extra = 1


@admin.register(PlantillaChecklist)
class PlantillaChecklistAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'tipo_entidad',
        'categoria',
        'activa',
    )
    list_filter = ('tipo_entidad', 'categoria', 'activa')
    search_fields = ('nombre',)
    ordering = ('nombre',)
    inlines = [PlantillaChecklistItemInline]


@admin.register(PlantillaChecklistItem)
class PlantillaChecklistItemAdmin(admin.ModelAdmin):
    list_display = (
        'plantilla',
        'nombre',
        'tipo_respuesta',
        'obligatorio',
        'orden',
    )
    list_filter = ('tipo_respuesta', 'obligatorio', 'plantilla')
    search_fields = (
        'nombre',
        'descripcion',
        'plantilla__nombre',
    )
    ordering = ('plantilla', 'orden')


@admin.register(RegistroAcceso)
class RegistroAccesoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'tipo_movimiento',
        'tipo_entidad',
        'vehiculo',
        'empleado',
        'conductor',
        'visitante',
        'guardia',
        'turno',
        'fecha_hora',
        'tiene_evidencia',
        'checklist_requerido',
        'checklist_realizado',
    )
    list_filter = (
        'tipo_movimiento',
        'tipo_entidad',
        'tiene_evidencia',
        'requiere_evidencia',
        'checklist_requerido',
        'checklist_realizado',
        'fecha_hora',
    )
    search_fields = (
        'vehiculo__placa',
        'empleado__nombre_completo',
        'empleado__numero_empleado',
        'conductor__nombre_completo',
        'visitante__nombre_completo',
        'guardia__username',
        'observaciones',
    )
    ordering = ('-fecha_hora',)
    autocomplete_fields = (
        'vehiculo',
        'empleado',
        'conductor',
        'visitante',
        'guardia',
        'turno',
    )


@admin.register(ChecklistRegistro)
class ChecklistRegistroAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'registro_acceso',
        'plantilla',
        'registrado_por',
        'resultado_general',
        'fecha_hora',
    )
    list_filter = ('resultado_general', 'plantilla', 'fecha_hora')
    search_fields = (
        'registro_acceso_vehiculo_placa',
        'registro_acceso_guardia_username',
        'plantilla__nombre',
        'registrado_por__username',
        'observaciones_generales',
    )
    ordering = ('-fecha_hora',)
    autocomplete_fields = (
        'registro_acceso',
        'plantilla',
        'registrado_por',
    )


@admin.register(ChecklistItemResultado)
class ChecklistItemResultadoAdmin(admin.ModelAdmin):
    list_display = (
        'checklist',
        'item_plantilla',
        'valor_booleano',
        'valor_texto',
    )
    list_filter = ('item_plantilla', 'valor_booleano')
    search_fields = (
        'item_plantilla__nombre',
        'observacion',
        'valor_texto',
    )
    ordering = ('checklist',)


@admin.register(Evidencia)
class EvidenciaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'registro_acceso',
        'checklist',
        'capturada_por',
        'fecha_hora',
    )
    list_filter = ('fecha_hora',)
    search_fields = (
        'registro_acceso_vehiculo_placa',
        'registro_acceso_guardia_username',
        'capturada_por__username',
        'descripcion',
    )
    ordering = ('-fecha_hora',)
    autocomplete_fields = (
        'registro_acceso',
        'checklist',
        'capturada_por',
    )


@admin.register(AuditoriaEvento)
class AuditoriaEventoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'usuario',
        'tipo_evento',
        'referencia_modelo',
        'referencia_id',
        'fecha_hora',
        'ip',
    )
    list_filter = ('tipo_evento', 'fecha_hora')
    search_fields = (
        'usuario__username',
        'descripcion',
        'referencia_modelo',
        'ip',
    )
    ordering = ('-fecha_hora',)
    autocomplete_fields = ('usuario',)


@admin.register(ChecklistTractoItemCatalogo)
class ChecklistTractoItemCatalogoAdmin(admin.ModelAdmin):
    list_display = (
        'codigo',
        'seccion',
        'nombre',
        'orden',
        'tipo_respuesta',
        'activo',
    )
    list_filter = ('seccion', 'tipo_respuesta', 'activo')
    search_fields = ('codigo', 'nombre')
    ordering = ('seccion', 'orden', 'id')


class ChecklistTractoResultadoInline(admin.TabularInline):
    model = ChecklistTractoResultado
    extra = 0
    autocomplete_fields = ('item',)


class ChecklistTractoLlantaInline(admin.TabularInline):
    model = ChecklistTractoLlanta
    extra = 0


class ChecklistTractoEvidenciaInline(admin.TabularInline):
    model = ChecklistTractoEvidencia
    extra = 0


@admin.register(ChecklistTracto)
class ChecklistTractoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'fecha_hora',
        'vehiculo',
        'conductor',
        'guardia',
        'estatus_general',
        'turno',
    )
    list_filter = (
        'estatus_general',
        'turno',
        'guardia',
        'fecha_hora',
    )
    search_fields = (
        'vehiculo__placa',
        'conductor__nombre_completo',
        'guardia__username',
        'observaciones_generales',
    )
    ordering = ('-fecha_hora', '-id')
    autocomplete_fields = (
        'registro_acceso',
        'turno',
        'guardia',
        'vehiculo',
        'conductor',
    )
    inlines = [
        ChecklistTractoResultadoInline,
        ChecklistTractoLlantaInline,
        ChecklistTractoEvidenciaInline,
    ]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'fecha_hora',
        'usuario',
        'modulo',
        'accion',
        'entidad_tipo',
        'entidad_id',
        'turno',
    )
    list_filter = (
        'modulo',
        'accion',
        'turno',
        'fecha_hora',
    )
    search_fields = (
        'usuario__username',
        'descripcion',
        'entidad_tipo',
    )
    ordering = ('-fecha_hora', '-id')
    autocomplete_fields = (
        'usuario',
        'turno',
    )