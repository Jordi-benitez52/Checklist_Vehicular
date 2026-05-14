from django.urls import path

from .views import (
    web_login_view,
    web_logout_view,
    admin_dashboard_view,
    admin_asignaciones,
    registro_acceso_list_view,

    vehiculo_list_view,
    vehiculo_create_view,
    vehiculo_update_view,
    vehiculo_desactivar_view,
    vehiculos_en_instalacion_view,

    empleado_list_view,
    empleado_create_view,
    empleado_update_view,
    empleado_desactivar_view,

    asignacion_list_view,
    asignacion_create_view,
    asignacion_update_view,
    asignacion_desactivar_view,

    conductor_list_view,
    conductor_create_view,
    conductor_update_view,
    conductor_desactivar_view,

    turno_list_view,
    turno_create_view,
    turno_update_view,
    turno_cerrar_view,
    turno_historial_view,
    reporte_turno_detalle_view,

    checklist_tracto_list_view,
    checklist_tracto_create_view,
    checklist_tracto_detail_view,

    guardia_list_view,
    guardia_create_view,
    guardia_update_view,
    guardia_delete_view,
    admin_list_view,

    evidencia_list_view,
    audit_list_view,

    reporte_turnos_view,
    reporte_registros_view,
    reporte_checklists_view,
    reporte_auditoria_view,
)


urlpatterns = [
    # =========================
    # Login / Logout
    # =========================
    path('', web_login_view, name='web-login'),
    path('login/', web_login_view, name='web-login-alt'),
    path('logout/', web_logout_view, name='web-logout'),

    # =========================
    # Dashboard / reportes
    # =========================
    path('dashboard/', admin_dashboard_view, name='web-dashboard'),
    path('reportes/', reporte_registros_view, name='web-reportes'),
    path('admin-dashboard/', admin_dashboard_view, name='web-admin-dashboard'),
    path('reportes/turnos/', reporte_turnos_view, name='web-reportes-turnos'),
    path('reportes/registros/', reporte_registros_view, name='web-reportes-registros'),
    path('reportes/checklists/', reporte_checklists_view, name='web-reportes-checklists'),
    path('reportes/auditoria/', reporte_auditoria_view, name='web-reportes-auditoria'),

    # =========================
    # Asignaciones normalizadas (Admin)
    # =========================
    path('admin/asignaciones/', admin_asignaciones, name='web-admin-asignaciones'),

    # =========================
    # Registros de Acceso
    # =========================
    path('registros-acceso/', registro_acceso_list_view, name='web-registros-acceso'),

    # =========================
    # Vehículos
    # =========================
    path('vehiculos/', vehiculo_list_view, name='web-vehiculos'),
    path('vehiculos/nuevo/', vehiculo_create_view, name='web-vehiculo-nuevo'),
    path('vehiculos/<int:pk>/editar/', vehiculo_update_view, name='web-vehiculo-editar'),
    path('vehiculos/<int:pk>/desactivar/', vehiculo_desactivar_view, name='web-vehiculo-desactivar'),
    path('vehiculos/en-instalacion/', vehiculos_en_instalacion_view, name='web-vehiculos-en-instalacion'),

    # =========================
    # Empleados
    # =========================
    path('empleados/', empleado_list_view, name='web-empleados'),
    path('empleados/nuevo/', empleado_create_view, name='web-empleado-nuevo'),
    path('empleados/<int:pk>/editar/', empleado_update_view, name='web-empleado-editar'),
    path('empleados/<int:pk>/desactivar/', empleado_desactivar_view, name='web-empleado-desactivar'),

    # =========================
    # Asignaciones vehículo-empleado
    # =========================
    path('asignaciones/', asignacion_list_view, name='web-asignaciones'),
    path('asignaciones/nuevo/', asignacion_create_view, name='web-asignacion-nuevo'),
    path('asignaciones/<int:pk>/editar/', asignacion_update_view, name='web-asignacion-editar'),
    path('asignaciones/<int:pk>/desactivar/', asignacion_desactivar_view, name='web-asignacion-desactivar'),

    # =========================
    # Conductores
    # =========================
    path('conductores/', conductor_list_view, name='web-conductores'),
    path('conductores/nuevo/', conductor_create_view, name='web-conductor-nuevo'),
    path('conductores/<int:pk>/editar/', conductor_update_view, name='web-conductor-editar'),
    path('conductores/<int:pk>/desactivar/', conductor_desactivar_view, name='web-conductor-desactivar'),

    # =========================
    # Turnos
    # =========================
    path('turnos/', turno_list_view, name='web-turnos'),
    path('turnos/nuevo/', turno_create_view, name='web-turno-nuevo'),
    path('turnos/<int:pk>/editar/', turno_update_view, name='web-turno-editar'),
    path('turnos/<int:pk>/cerrar/', turno_cerrar_view, name='web-turno-cerrar'),
    path('turnos/<int:pk>/historial/', turno_historial_view, name='web-turno-historial'),
    path('turnos/<int:pk>/reporte/', reporte_turno_detalle_view, name='web-turno-reporte'),

    # =========================
    # Checklist tracto
    # =========================
    path('checklists-tracto/', checklist_tracto_list_view, name='web-checklists-tracto'),
    path('checklists-tracto/nuevo/', checklist_tracto_create_view, name='web-checklist-tracto-nuevo'),
    path('checklists-tracto/<int:pk>/', checklist_tracto_detail_view, name='web-checklist-tracto-detalle'),

    # =========================
    # Guardias / perfiles
    # =========================
    path('guardias/', guardia_list_view, name='web-guardias'),
    path('guardias/nuevo/', guardia_create_view, name='web-guardia-nuevo'),
    path('guardias/<int:pk>/editar/', guardia_update_view, name='web-guardia-editar'),
    path('guardias/<int:pk>/eliminar/', guardia_delete_view, name='web-guardia-eliminar'),

    # =========================
    # Administradores
    # =========================
    path('admins/', admin_list_view, name='web-admins'),
    path('admins/nuevo/', guardia_create_view, name='web-admin-nuevo'),
    path('admins/<int:pk>/editar/', guardia_update_view, name='web-admin-editar'),

    # =========================
    # Evidencias
    # =========================
    path('evidencias/', evidencia_list_view, name='web-evidencias'),

    # =========================
    # Auditoría
    # =========================
    path('auditoria/', audit_list_view, name='web-auditoria'),
]