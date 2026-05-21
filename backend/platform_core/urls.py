from django.urls import path
from .health import HealthCheckView

from .views import (
    # Vehículos
    VehiculoListAPIView,
    VehiculoCreateAPIView,
    VehiculoDetailAPIView,
    VehiculoUpdateAPIView,
    VehiculoDesactivarAPIView,
    VehiculosEnInstalacionAPIView,
    VehiculosDisponiblesAPIView,
    ConductoresDisponiblesAPIView,
    EmpleadosConVehiculoDisponibleAPIView,

    # Empleados y conductores
    EmpleadoListAPIView,
    EmpleadoCreateAPIView,
    EmpleadoUpdateAPIView,
    EmpleadoDesactivarAPIView,
    ConductorListAPIView,
    ConductorCreateAPIView,
    ConductorUpdateAPIView,
    ConductorDesactivarAPIView,

    # Turnos
    TurnoListAPIView,
    TurnoCreateAPIView,
    TurnoCloseAPIView,

    # Asignaciones
    AsignacionVehiculoEmpleadoListAPIView,
    EmpleadosConVehiculoAsignadoAPIView,

    # Plantillas y checklist general
    PlantillaChecklistListAPIView,
    ChecklistRegistroListAPIView,
    ChecklistRegistroCreateAPIView,

    # Registro de acceso
    RegistroAccesoListAPIView,
    RegistroAccesoCreateAPIView,
    RegistroAccesoPendientesSalidaAPIView,

    # Visitantes
    VisitanteRegistroListCreateAPIView,
    VisitantesPendientesSalidaAPIView,

    # Checklist tracto
    ChecklistTractoItemCatalogoListAPIView,
    ChecklistTractoListAPIView,
    ChecklistTractoCreateAPIView,
    ChecklistTractoDetailAPIView,

    # Auditoría / reportes
    AuditLogListAPIView,
    ReportesAPIView,
    ReportePDFAPIView,
    ReporteExcelAPIView,

    # NUEVAS APIs: Asignaciones normalizadas
    AsignacionConductorVehiculoListAPIView,
    AsignacionConductorVehiculoCreateAPIView,
    AsignacionConductorVehiculoDesasignarAPIView,
    AsignacionEmpleadoVehiculoListAPIView,
    AsignacionEmpleadoVehiculoCreateAPIView,
    HistorialUsoVehiculoListAPIView,
    VehiculosDentroAPIView,
    BitacoraCambiosListAPIView,

    # Notificaciones push
    NotificacionListCreateAPIView,
    NotificacionMarkReadAPIView,
    NotificacionMarkAllReadAPIView,
    EnviarNotificacionTurnoAPIView,
)


urlpatterns = [
    # =========================
    # Vehículos
    # =========================
    path('vehiculos/', VehiculoListAPIView.as_view(), name='platform-vehiculos'),
    path('vehiculos/crear/', VehiculoCreateAPIView.as_view(), name='platform-vehiculo-crear'),
    path('vehiculos/<int:pk>/', VehiculoDetailAPIView.as_view(), name='platform-vehiculo-detalle'),
    path('vehiculos/<int:pk>/editar/', VehiculoUpdateAPIView.as_view(), name='platform-vehiculo-editar'),
    path('vehiculos/<int:pk>/desactivar/', VehiculoDesactivarAPIView.as_view(), name='platform-vehiculo-desactivar'),
    path('vehiculos/en-instalacion/', VehiculosEnInstalacionAPIView.as_view(), name='platform-vehiculos-en-instalacion'),
    path('vehiculos/disponibles/', VehiculosDisponiblesAPIView.as_view(), name='platform-vehiculos-disponibles'),
    path('conductores/disponibles/', ConductoresDisponiblesAPIView.as_view(), name='platform-conductores-disponibles'),

    # =========================
    # Empleados / Conductores / Visitantes
    # =========================
    path('empleados/', EmpleadoListAPIView.as_view(), name='platform-empleados'),
    path('empleados/crear/', EmpleadoCreateAPIView.as_view(), name='platform-empleado-crear'),
    path('empleados/<int:pk>/', EmpleadoListAPIView.as_view(), name='platform-empleado-detalle'),
    path('empleados/<int:pk>/editar/', EmpleadoUpdateAPIView.as_view(), name='platform-empleado-editar'),
    path('empleados/<int:pk>/desactivar/', EmpleadoDesactivarAPIView.as_view(), name='platform-empleado-desactivar'),
    path('conductores/', ConductorListAPIView.as_view(), name='platform-conductores'),
    path('conductores/crear/', ConductorCreateAPIView.as_view(), name='platform-conductor-crear'),
    path('conductores/<int:pk>/', ConductorListAPIView.as_view(), name='platform-conductor-detalle'),
    path('conductores/<int:pk>/editar/', ConductorUpdateAPIView.as_view(), name='platform-conductor-editar'),
    path('conductores/<int:pk>/desactivar/', ConductorDesactivarAPIView.as_view(), name='platform-conductor-desactivar'),
    path('visitantes/', VisitanteRegistroListCreateAPIView.as_view(), name='platform-visitantes'),
    path('visitantes/pendientes/', VisitantesPendientesSalidaAPIView.as_view(), name='platform-visitantes-pendientes'),
    path('asignaciones/empleados-con-vehiculo-disponible/', EmpleadosConVehiculoDisponibleAPIView.as_view(), name='platform-empleados-vehiculo-disponible'),

    # =========================
    # Turnos
    # =========================
    path('turnos/', TurnoListAPIView.as_view(), name='platform-turnos'),
    path('turnos/crear/', TurnoCreateAPIView.as_view(), name='platform-turno-crear'),
    path('turnos/<int:pk>/cerrar/', TurnoCloseAPIView.as_view(), name='platform-turno-cerrar'),

    # =========================
    # Asignaciones vehículo-empleado
    # =========================
    path('asignaciones/', AsignacionVehiculoEmpleadoListAPIView.as_view(), name='platform-asignaciones'),
    path('asignaciones/empleados-con-vehiculo/', EmpleadosConVehiculoAsignadoAPIView.as_view(), name='platform-asignaciones-empleados-vehiculo'),

    # =========================
    # Plantillas checklist general
    # =========================
    path('plantillas-checklist/', PlantillaChecklistListAPIView.as_view(), name='platform-plantillas-checklist'),

    # =========================
    # Registro de acceso
    # =========================
    path('registros-acceso/', RegistroAccesoListAPIView.as_view(), name='platform-registros-acceso'),
    path('registros-acceso/crear/', RegistroAccesoCreateAPIView.as_view(), name='platform-registro-acceso-crear'),
    path('registros-acceso/pendientes-salida/', RegistroAccesoPendientesSalidaAPIView.as_view(), name='platform-registros-pendientes-salida'),

    # =========================
    # Checklist general
    # =========================
    path('checklists-registro/', ChecklistRegistroListAPIView.as_view(), name='platform-checklists-registro'),
    path('checklists-registro/crear/', ChecklistRegistroCreateAPIView.as_view(), name='platform-checklist-registro-crear'),

    # =========================
    # Checklist tracto
    # =========================
    path(
        'checklists-tracto/catalogo-items/',
        ChecklistTractoItemCatalogoListAPIView.as_view(),
        name='platform-checklist-tracto-catalogo-items'
    ),
    path('checklists-tracto/', ChecklistTractoListAPIView.as_view(), name='platform-checklists-tracto'),
    path('checklists-tracto/crear/', ChecklistTractoCreateAPIView.as_view(), name='platform-checklist-tracto-crear'),
    path('checklists-tracto/<int:pk>/', ChecklistTractoDetailAPIView.as_view(), name='platform-checklist-tracto-detalle'),

    # =========================
    # Auditoría / reportes
    # =========================
    path('auditoria/', AuditLogListAPIView.as_view(), name='platform-auditoria'),
    path('reportes/', ReportesAPIView.as_view(), name='platform-reportes'),
    path('reportes/export/pdf/', ReportePDFAPIView.as_view(), name='platform-reportes-export-pdf'),
    path('reportes/export/excel/', ReporteExcelAPIView.as_view(), name='platform-reportes-export-excel'),

    # =========================
    # NUEVAS APIs: Asignaciones normalizadas
    # =========================
    path('asignaciones/conductor-vehiculo/', AsignacionConductorVehiculoListAPIView.as_view(), name='platform-asignaciones-conductor-vehiculo'),
    path('asignaciones/conductor-vehiculo/crear/', AsignacionConductorVehiculoCreateAPIView.as_view(), name='platform-asignacion-conductor-vehiculo-crear'),
    path('asignaciones/conductor-vehiculo/desasignar/', AsignacionConductorVehiculoDesasignarAPIView.as_view(), name='platform-asignacion-conductor-vehiculo-desasignar'),
    path('asignaciones/empleado-vehiculo/', AsignacionEmpleadoVehiculoListAPIView.as_view(), name='platform-asignaciones-empleado-vehiculo'),
    path('asignaciones/empleado-vehiculo/crear/', AsignacionEmpleadoVehiculoCreateAPIView.as_view(), name='platform-asignacion-empleado-vehiculo-crear'),

    # Historial y bitácora
    path('historial-uso-vehiculo/', HistorialUsoVehiculoListAPIView.as_view(), name='platform-historial-uso-vehiculo'),
    path('vehiculos/dentro/', VehiculosDentroAPIView.as_view(), name='platform-vehiculos-dentro'),
    path('bitacora/', BitacoraCambiosListAPIView.as_view(), name='platform-bitacora'),

    # Notificaciones push
    path('notificaciones/', NotificacionListCreateAPIView.as_view(), name='platform-notificaciones'),
    path('notificaciones/<int:pk>/leer/', NotificacionMarkReadAPIView.as_view(), name='platform-notificacion-leer'),
    path('notificaciones/leer-todos/', NotificacionMarkAllReadAPIView.as_view(), name='platform-notificaciones-leer-todos'),
    path('notificaciones/enviar-turno/', EnviarNotificacionTurnoAPIView.as_view(), name='platform-enviar-notificacion-turno'),

    # Health check
    path('health/', HealthCheckView.as_view(), name='platform-health'),
]