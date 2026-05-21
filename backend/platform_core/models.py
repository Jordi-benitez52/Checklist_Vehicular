import uuid

from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone


# =========================
# PERFIL DE USUARIO
# =========================
# NOTA:
# Este modelo se mantiene porque tu proyecto ya lo tiene migrado.
# Más adelante revisaremos accounts/models.py para evitar duplicidad de UserProfile.

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('guardia', 'Guardia'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='platform_profile'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active_user = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# =========================
# TURNOS
# =========================

class Turno(models.Model):
    TURNO_CHOICES = [
        ('matutino', 'Matutino'),
        ('vespertino', 'Vespertino'),
        ('nocturno', 'Nocturno'),
    ]

    guardia = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='turnos'
    )
    tipo_turno = models.CharField(max_length=20, choices=TURNO_CHOICES)
    fecha = models.DateField()
    hora_apertura = models.DateTimeField()
    hora_cierre = models.DateTimeField(blank=True, null=True)
    abierto = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)
    observaciones_cierre = models.TextField(blank=True, null=True)
    firma_cierre = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha', '-hora_apertura']

    def __str__(self):
        estado = 'Abierto' if self.abierto else 'Cerrado'
        return f"{self.guardia.username} - {self.get_tipo_turno_display()} - {self.fecha} - {estado}"


# =========================
# CATÁLOGOS BASE
# =========================

class Empleado(models.Model):
    numero_empleado = models.CharField(max_length=30, unique=True)
    nombre_completo = models.CharField(max_length=150)
    departamento = models.CharField(max_length=100, blank=True)
    puesto = models.CharField(max_length=100, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre_completo']

    def save(self, *args, **kwargs):
        self.numero_empleado = (self.numero_empleado or '').strip().upper()
        self.nombre_completo = (self.nombre_completo or '').strip()
        self.departamento = (self.departamento or '').strip()
        self.puesto = (self.puesto or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero_empleado} - {self.nombre_completo}"


class Conductor(models.Model):
    nombre_completo = models.CharField(max_length=150)
    licencia = models.CharField(max_length=50, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    empresa = models.CharField(max_length=120, blank=True)
    activo = models.BooleanField(default=True)
    vehiculo = models.OneToOneField(
        'Vehiculo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conductor_asignado'
    )

    class Meta:
        ordering = ['nombre_completo']

    def save(self, *args, **kwargs):
        self.nombre_completo = (self.nombre_completo or '').strip()
        self.licencia = (self.licencia or '').strip().upper()
        self.telefono = (self.telefono or '').strip()
        self.empresa = (self.empresa or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        vehiculo_info = f" ({self.vehiculo.placa})" if self.vehiculo else ""
        return f"{self.nombre_completo}{vehiculo_info}"


class Vehiculo(models.Model):
    TIPO_ENTIDAD_CHOICES = [
        ('tracto', 'Tractocamión'),
        ('empleado', 'Vehículo de empleado'),
        ('visitante', 'Vehículo de visitante/proveedor'),
    ]

    CATEGORIA_CHOICES = [
        ('tractocamion', 'Tractocamión'),
        ('camioneta', 'Camioneta'),
        ('automovil', 'Automóvil'),
        ('moto', 'Moto'),
        ('otro', 'Otro'),
    ]

    EMPRESA_CHOICES = [
        ('LRA', 'LRA'),
        ('PRO', 'PRO'),
        ('CON', 'CON'),
    ]

    clave_interna = models.CharField(max_length=30, blank=True, null=True, unique=True)
    placa = models.CharField(max_length=20, unique=True)
    tipo_entidad = models.CharField(max_length=20, choices=TIPO_ENTIDAD_CHOICES)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    empresa = models.CharField(max_length=20, choices=EMPRESA_CHOICES, blank=True)
    marca = models.CharField(max_length=80, blank=True)
    modelo = models.CharField(max_length=80, blank=True)
    color = models.CharField(max_length=40, blank=True)
    numero_economico = models.CharField(max_length=40, blank=True)
    activo = models.BooleanField(default=True)
    requiere_checklist = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)
    en_instalacion = models.BooleanField(default=False)
    conductor_actual = models.ForeignKey(
        'Conductor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehiculo_conductor'
    )
    ultimo_empleado = models.ForeignKey(
        'Empleado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehiculo_ultimo_empleado'
    )

    class Meta:
        ordering = ['placa']

    def save(self, *args, **kwargs):
        self.clave_interna = (self.clave_interna or '').strip().upper() or None
        self.placa = (self.placa or '').strip().upper()
        self.empresa = (self.empresa or '').strip()
        self.marca = (self.marca or '').strip()
        self.modelo = (self.modelo or '').strip()
        self.color = (self.color or '').strip()
        self.numero_economico = (self.numero_economico or '').strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.clave_interna:
            return f"{self.clave_interna} / {self.placa}"
        return self.placa


class AsignacionVehiculoEmpleado(models.Model):
    vehiculo = models.OneToOneField(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='asignacion_empleado'
    )
    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.CASCADE,
        related_name='vehiculos_asignados'
    )
    activa = models.BooleanField(default=True)
    fecha_asignacion = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_asignacion']

    def __str__(self):
        return f"{self.vehiculo.placa} -> {self.empleado.nombre_completo}"


class VisitanteRegistro(models.Model):
    TIPO_VISITANTE_CHOICES = [
        ('proveedor', 'Proveedor'),
        ('visitante', 'Visitante'),
        ('otro', 'Otro'),
    ]

    tipo_visitante = models.CharField(max_length=20, choices=TIPO_VISITANTE_CHOICES)
    nombre_completo = models.CharField(max_length=150)
    empresa = models.CharField(max_length=150, blank=True)
    vehiculo_tipo_general = models.CharField(max_length=80, blank=True)
    placas = models.CharField(max_length=20)
    motivo = models.CharField(max_length=200, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['nombre_completo']

    def save(self, *args, **kwargs):
        self.nombre_completo = (self.nombre_completo or '').strip()
        self.empresa = (self.empresa or '').strip()
        self.vehiculo_tipo_general = (self.vehiculo_tipo_general or '').strip()
        self.placas = (self.placas or '').strip().upper()
        self.motivo = (self.motivo or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre_completo} - {self.placas}"


# =========================
# CHECKLIST GENERAL
# =========================

class PlantillaChecklist(models.Model):
    TIPO_ENTIDAD_CHOICES = [
        ('tracto', 'Tractocamión'),
        ('empleado', 'Vehículo de empleado'),
        ('visitante', 'Vehículo de visitante/proveedor'),
    ]

    CATEGORIA_CHOICES = [
        ('tractocamion', 'Tractocamión'),
        ('camioneta', 'Camioneta'),
        ('automovil', 'Automóvil'),
        ('moto', 'Moto'),
        ('otro', 'Otro'),
    ]

    nombre = models.CharField(max_length=120)
    tipo_entidad = models.CharField(max_length=20, choices=TIPO_ENTIDAD_CHOICES)
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES)
    activa = models.BooleanField(default=True)

    class Meta:
        ordering = ['nombre']

    def save(self, *args, **kwargs):
        self.nombre = (self.nombre or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre


class PlantillaChecklistItem(models.Model):
    TIPO_RESPUESTA_CHOICES = [
        ('booleano', 'Sí/No'),
        ('texto', 'Texto'),
        ('seleccion', 'Selección'),
    ]

    plantilla = models.ForeignKey(
        PlantillaChecklist,
        on_delete=models.CASCADE,
        related_name='items'
    )
    nombre = models.CharField(max_length=120)
    descripcion = models.CharField(max_length=200, blank=True)
    obligatorio = models.BooleanField(default=True)
    tipo_respuesta = models.CharField(
        max_length=20,
        choices=TIPO_RESPUESTA_CHOICES,
        default='booleano'
    )
    orden = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['plantilla', 'orden']

    def save(self, *args, **kwargs):
        self.nombre = (self.nombre or '').strip()
        self.descripcion = (self.descripcion or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.plantilla.nombre} - {self.nombre}"


# =========================
# REGISTRO DE ACCESO
# =========================

class RegistroAcceso(models.Model):
    TIPO_MOVIMIENTO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    TIPO_ENTIDAD_CHOICES = [
        ('tracto', 'Tractocamión'),
        ('empleado', 'Empleado con vehículo asignado'),
        ('empleado_propio', 'Empleado con vehículo propio'),
        ('visitante', 'Visitante/Proveedor'),
        ('conductor', 'Conductor (vehículo propio)'),
    ]

    turno = models.ForeignKey(
        Turno,
        on_delete=models.PROTECT,
        related_name='registros'
    )
    guardia = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='registros_acceso'
    )
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO_CHOICES)
    tipo_entidad = models.CharField(max_length=20, choices=TIPO_ENTIDAD_CHOICES)

    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.PROTECT,
        related_name='registros',
        blank=True,
        null=True
    )
    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='registros',
        blank=True,
        null=True
    )
    conductor = models.ForeignKey(
        Conductor,
        on_delete=models.PROTECT,
        related_name='registros',
        blank=True,
        null=True
    )
    visitante = models.ForeignKey(
        VisitanteRegistro,
        on_delete=models.PROTECT,
        related_name='registros',
        blank=True,
        null=True
    )

    fecha_hora = models.DateTimeField(auto_now_add=True)
    observaciones = models.TextField(blank=True, null=True)

    requiere_evidencia = models.BooleanField(default=False)
    tiene_evidencia = models.BooleanField(default=False)

    evidencia_fotografica = models.ImageField(
        upload_to='evidencias/accesos/',
        blank=True,
        null=True
    )

    checklist_requerido = models.BooleanField(default=False)
    checklist_realizado = models.BooleanField(default=False)
    conductor_pendiente_salida = models.BooleanField(default=False)
    entrada_asociada = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='salidas_asociadas'
    )

    par_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='UUID que vincula entrada con salida'
    )

    class Meta:
        ordering = ['-fecha_hora', '-id']

    def clean(self):
        if self.tipo_entidad == 'conductor' and self.vehiculo:
            raise ValidationError({
                'vehiculo': 'Un conductor no debe tener vehículo asociado.'
            })

        if self.tipo_entidad == 'conductor' and self.empleado:
            raise ValidationError({
                'empleado': 'Un conductor no debe tener empleado asociado.'
            })

        if self.tipo_entidad == 'empleado_propio':
            if self.vehiculo:
                raise ValidationError({
                    'vehiculo': 'Un empleado con vehículo propio no debe tener vehículo en la bd.'
                })
            if self.empleado:
                raise ValidationError({
                    'empleado': 'Un empleado con vehículo propio no debe seleccionarse de la lista.'
                })

        if self.tipo_entidad == 'empleado' and not self.empleado:
            raise ValidationError({
                'empleado': 'Para un acceso de empleado debe seleccionarse un empleado.'
            })

        if self.tipo_entidad == 'tracto' and not self.vehiculo:
            raise ValidationError({
                'vehiculo': 'Para un acceso de tracto debe seleccionarse un vehículo.'
            })

        if self.tipo_entidad == 'tracto' and self.vehiculo and self.vehiculo.tipo_entidad != 'tracto':
            raise ValidationError({
                'vehiculo': 'El vehículo seleccionado debe ser de tipo tracto.'
            })

        if self.tipo_entidad == 'visitante' and not self.visitante:
            raise ValidationError({
                'visitante': 'Para un acceso de visitante debe seleccionarse un visitante/proveedor.'
            })

    def save(self, *args, **kwargs):
        self.observaciones = (self.observaciones or '').strip()

        if self.vehiculo and self.tipo_entidad == 'tracto':
            self.checklist_requerido = self.vehiculo.requiere_checklist
        else:
            self.checklist_requerido = False

        if self.evidencia_fotografica:
            self.tiene_evidencia = True

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_tipo_movimiento_display()} - {self.get_tipo_entidad_display()} - {self.fecha_hora}"


# =========================
# CHECKLIST DE TRACTOCAMIÓN
# =========================

class ChecklistTracto(models.Model):
    ESTATUS_GENERAL_CHOICES = [
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('condicionado', 'Condicionado'),
    ]

    registro_acceso = models.OneToOneField(
        RegistroAcceso,
        on_delete=models.CASCADE,
        related_name='checklist_tracto'
    )
    turno = models.ForeignKey(
        Turno,
        on_delete=models.CASCADE,
        related_name='checklists_tracto'
    )
    guardia = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='checklists_tracto'
    )
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='checklists_tracto'
    )
    conductor = models.ForeignKey(
        Conductor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='checklists_tracto'
    )

    fecha_hora = models.DateTimeField(default=timezone.now)
    estatus_general = models.CharField(max_length=20, choices=ESTATUS_GENERAL_CHOICES)
    observaciones_generales = models.TextField(blank=True, null=True)

    firma_operador_data = models.TextField(blank=True, null=True)
    firma_vigilante_data = models.TextField(blank=True, null=True)
    firma_supervisor_data = models.TextField(blank=True, null=True)

    nombre_operador = models.CharField(max_length=120, blank=True, default='')
    nombre_vigilante = models.CharField(max_length=120, blank=True, default='')
    nombre_supervisor = models.CharField(max_length=120, blank=True, default='')

    class Meta:
        ordering = ['-fecha_hora', '-id']

    def clean(self):
        if self.registro_acceso and self.registro_acceso.tipo_entidad != 'tracto':
            raise ValidationError({
                'registro_acceso': 'El checklist de tracto solo puede ligarse a registros de acceso de tipo tracto.'
            })

        if self.vehiculo and self.vehiculo.tipo_entidad != 'tracto':
            raise ValidationError({
                'vehiculo': 'El vehículo del checklist debe ser un tractocamión.'
            })

    def save(self, *args, **kwargs):
        self.observaciones_generales = (self.observaciones_generales or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Checklist tracto - {self.vehiculo.placa} - {self.fecha_hora}"


class ChecklistTractoItemCatalogo(models.Model):
    TIPO_RESPUESTA_CHOICES = [
        ('binario', 'OK / Falla / N/A'),
        ('nivel', 'Nivel (Max/Mitad/Bajo/Muy bajo)'),
        ('booleano', 'Bueno / Malo'),
    ]

    SECCION_CHOICES = [
        ('combustible', 'Combustible'),
        ('habitaculo', 'Habitáculo'),
        ('luz_y_visibilidad', 'Luz y Visibilidad'),
        ('motor_y_chasis', 'Motor y Chasis'),
        ('seguridad', 'Seguridad'),
        ('accesorios', 'Accesorios y herramientas'),
        ('apariencia', 'Apariencia general'),
        ('ventanas', 'Ventanas'),
        ('espejos', 'Espejos'),
        ('luces', 'Luces'),
        ('aceite', 'Aceite'),
        ('enfriamiento', 'Enfriamiento'),
        ('fugas', 'Fugas'),
        ('frenos', 'Frenos'),
        ('loderas', 'Loderas'),
        ('otros', 'Otros'),
    ]

    codigo = models.CharField(max_length=40, unique=True)
    seccion = models.CharField(max_length=30, choices=SECCION_CHOICES)
    nombre = models.CharField(max_length=150)
    orden = models.PositiveIntegerField(default=1)
    activo = models.BooleanField(default=True)
    tipo_respuesta = models.CharField(
        max_length=20,
        choices=TIPO_RESPUESTA_CHOICES,
        default='binario'
    )

    class Meta:
        ordering = ['seccion', 'orden', 'id']

    def save(self, *args, **kwargs):
        self.codigo = (self.codigo or '').strip().lower()
        self.nombre = (self.nombre or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_seccion_display()} - {self.nombre}"


class ChecklistTractoResultado(models.Model):
    VALOR_CHOICES = [
        ('ok', 'Correcto'),
        ('mal', 'Con daño / falla'),
        ('na', 'No aplica'),
    ]

    checklist = models.ForeignKey(
        ChecklistTracto,
        on_delete=models.CASCADE,
        related_name='resultados'
    )
    item = models.ForeignKey(
        ChecklistTractoItemCatalogo,
        on_delete=models.CASCADE,
        related_name='resultados'
    )
    valor = models.CharField(max_length=10, choices=VALOR_CHOICES)
    observacion = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('checklist', 'item')
        ordering = ['item__seccion', 'item__orden', 'id']

    def save(self, *args, **kwargs):
        self.observacion = (self.observacion or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.checklist_id} - {self.item.nombre} - {self.get_valor_display()}"

class ChecklistTractoLlanta(models.Model):
    POSICION_CHOICES = [
        ('delantera_izquierda', 'Delantera izquierda'),
        ('delantera_derecha', 'Delantera derecha'),
        ('trasera_exterior_izquierda', 'Trasera exterior izquierda'),
        ('trasera_interior_izquierda', 'Trasera interior izquierda'),
        ('trasera_interior_derecha', 'Trasera interior derecha'),
        ('trasera_exterior_derecha', 'Trasera exterior derecha'),
        ('remolque_1_izquierda', 'Remolque 1 izquierda'),
        ('remolque_1_derecha', 'Remolque 1 derecha'),
        ('remolque_2_izquierda', 'Remolque 2 izquierda'),
        ('remolque_2_derecha', 'Remolque 2 derecha'),
    ]

    ESTADO_CHOICES = [
        ('ok', 'Correcta'),
        ('regular', 'Regular'),
        ('mal', 'Con daño'),
        ('na', 'No aplica'),
    ]

    checklist = models.ForeignKey(
        ChecklistTracto,
        on_delete=models.CASCADE,
        related_name='llantas'
    )
    posicion = models.CharField(max_length=40, choices=POSICION_CHOICES)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    observacion = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('checklist', 'posicion')
        ordering = ['id']

    def save(self, *args, **kwargs):
        self.observacion = (self.observacion or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.checklist_id} - {self.get_posicion_display()} - {self.get_estado_display()}"


class ChecklistTractoEvidencia(models.Model):
    SECCION_CHOICES = [
        ('accesorios', 'Accesorios'),
        ('luces', 'Luces'),
        ('motor', 'Motor'),
        ('frenos', 'Frenos'),
        ('llantas', 'Llantas'),
        ('general', 'General'),
    ]

    checklist = models.ForeignKey(
        ChecklistTracto,
        on_delete=models.CASCADE,
        related_name='evidencias'
    )
    imagen = models.ImageField(upload_to='checklists/tracto/')
    descripcion = models.CharField(max_length=200, blank=True)
    seccion = models.CharField(max_length=50, choices=SECCION_CHOICES, default='general')
    uuid_evidencia = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    class Meta:
        ordering = ['id']

    def save(self, *args, **kwargs):
        self.descripcion = (self.descripcion or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Evidencia {self.uuid_evidencia}"


# =========================
# AUDITORÍA ACTUAL
# =========================

class AuditLog(models.Model):
    MODULO_CHOICES = [
        ('turnos', 'Turnos'),
        ('accesos', 'Registro de acceso'),
        ('checklist_tracto', 'Checklist tracto'),
        ('perfil', 'Perfil'),
        ('catalogos', 'Catálogos'),
        ('sistema', 'Sistema'),
        ('usuarios', 'Usuarios'),
    ]

    ACCION_CHOICES = [
        ('crear', 'Crear'),
        ('editar', 'Editar'),
        ('cerrar', 'Cerrar'),
        ('consultar', 'Consultar'),
        ('subir_evidencia', 'Subir evidencia'),
        ('login', 'Inicio de sesión'),
        ('eliminar', 'Eliminar'),
        ('asignar', 'Asignar'),
        ('desasignar', 'Desasignar'),
        ('otro', 'Otro'),
    ]

    fecha_hora = models.DateTimeField(default=timezone.now)
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='auditorias'
    )
    modulo = models.CharField(max_length=30, choices=MODULO_CHOICES)
    accion = models.CharField(max_length=30, choices=ACCION_CHOICES)
    descripcion = models.TextField()
    entidad_tipo = models.CharField(max_length=50, blank=True)
    entidad_id = models.PositiveIntegerField(null=True, blank=True)
    turno = models.ForeignKey(
        Turno,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='auditorias'
    )

    class Meta:
        ordering = ['-fecha_hora', '-id']

    def save(self, *args, **kwargs):
        self.descripcion = (self.descripcion or '').strip()
        self.entidad_tipo = (self.entidad_tipo or '').strip()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        usuario = self.usuario.username if self.usuario else 'sin usuario'
        return f"{self.fecha_hora} - {usuario} - {self.get_modulo_display()} - {self.get_accion_display()}"


# =========================
# CHECKLIST GENERAL REALIZADO
# =========================

class ChecklistRegistro(models.Model):
    RESULTADO_GENERAL_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('condicionado', 'Condicionado'),
    ]

    registro_acceso = models.OneToOneField(
        RegistroAcceso,
        on_delete=models.CASCADE,
        related_name='checklist'
    )
    plantilla = models.ForeignKey(
        PlantillaChecklist,
        on_delete=models.PROTECT,
        related_name='checklists_realizados'
    )
    registrado_por = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='checklists_registrados'
    )
    resultado_general = models.CharField(
        max_length=50,
        choices=RESULTADO_GENERAL_CHOICES,
        default='pendiente'
    )
    observaciones_generales = models.TextField(blank=True, null=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_hora', '-id']

    def save(self, *args, **kwargs):
        self.observaciones_generales = (self.observaciones_generales or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Checklist #{self.id} - Registro {self.registro_acceso_id}"


class ChecklistItemResultado(models.Model):
    checklist = models.ForeignKey(
        ChecklistRegistro,
        on_delete=models.CASCADE,
        related_name='resultados'
    )
    item_plantilla = models.ForeignKey(
        PlantillaChecklistItem,
        on_delete=models.PROTECT
    )
    valor_booleano = models.BooleanField(blank=True, null=True)
    valor_texto = models.TextField(blank=True, null=True)
    observacion = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        self.valor_texto = (self.valor_texto or '').strip()
        self.observacion = (self.observacion or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.checklist_id} - {self.item_plantilla.nombre}"


# =========================
# EVIDENCIAS GENERALES
# =========================

class Evidencia(models.Model):
    registro_acceso = models.ForeignKey(
        RegistroAcceso,
        on_delete=models.CASCADE,
        related_name='evidencias',
        blank=True,
        null=True
    )
    checklist = models.ForeignKey(
        ChecklistRegistro,
        on_delete=models.CASCADE,
        related_name='evidencias',
        blank=True,
        null=True
    )
    archivo = models.ImageField(upload_to='evidencias/')
    descripcion = models.CharField(max_length=200, blank=True)
    capturada_por = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='evidencias_capturadas'
    )
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_hora', '-id']

    def save(self, *args, **kwargs):
        self.descripcion = (self.descripcion or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Evidencia #{self.id}"


# =========================
# ASIGNACIONES NORMALIZADAS
# =========================

class AsignacionConductorVehiculo(models.Model):
    """
    Tabla de asignaciones formales entre conductores y vehículos tractocamión.
    Permite múltiples asignaciones a lo largo del tiempo con historial.
    """
    conductor = models.ForeignKey(
        'Conductor',
        on_delete=models.CASCADE,
        related_name='asignaciones_vehiculo'
    )
    vehiculo = models.ForeignKey(
        'Vehiculo',
        on_delete=models.CASCADE,
        related_name='asignaciones_conductor'
    )
    activa = models.BooleanField(default=True)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    fecha_desasignacion = models.DateTimeField(null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_asignacion']
        verbose_name = 'Asignación Conductor-Vehículo'
        verbose_name_plural = 'Asignaciones Conductor-Vehículo'
        constraints = [
            models.UniqueConstraint(
                fields=['conductor', 'activa'],
                condition=models.Q(activa=True),
                name='unique_conductor_asignacion_activa'
            )
        ]

    def save(self, *args, **kwargs):
        if self.observaciones:
            self.observaciones = self.observaciones.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        estado = 'Activa' if self.activa else 'Inactiva'
        return f"{self.conductor.nombre_completo} -> {self.vehiculo.placa} ({estado})"

    def desasignar(self):
        """Desasigna el vehículo al conductor"""
        self.activa = False
        self.fecha_desasignacion = timezone.now()
        self.save()


class AsignacionEmpleadoVehiculo(models.Model):
    """
    Tabla de asignaciones formales entre empleados y vehículos de empresa.
    Permite múltiples asignaciones a lo largo del tiempo con historial.
    """
    empleado = models.ForeignKey(
        'Empleado',
        on_delete=models.CASCADE,
        related_name='asignaciones_vehiculo'
    )
    vehiculo = models.ForeignKey(
        'Vehiculo',
        on_delete=models.CASCADE,
        related_name='asignaciones_empleado'
    )
    activa = models.BooleanField(default=True)
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    fecha_desasignacion = models.DateTimeField(null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_asignacion']
        verbose_name = 'Asignación Empleado-Vehículo'
        verbose_name_plural = 'Asignaciones Empleado-Vehículo'

    def save(self, *args, **kwargs):
        if self.observaciones:
            self.observaciones = self.observaciones.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        estado = 'Activa' if self.activa else 'Inactiva'
        return f"{self.empleado.nombre_completo} -> {self.vehiculo.placa} ({estado})"

    def desasignar(self):
        """Desasigna el vehículo al empleado"""
        self.activa = False
        self.fecha_desasignacion = timezone.now()
        self.save()


class HistorialUsoVehiculo(models.Model):
    """
    Historial completo de uso de vehículos.
    Controla quién está dentro de la instalación y cuándo entró/salió.
    """
    TIPO_MOVIMIENTO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    vehiculo = models.ForeignKey(
        'Vehiculo',
        on_delete=models.CASCADE,
        related_name='historial_uso'
    )
    conductor = models.ForeignKey(
        'Conductor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historial_uso'
    )
    empleado = models.ForeignKey(
        'Empleado',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historial_uso'
    )
    visitante = models.ForeignKey(
        'VisitanteRegistro',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historial_uso'
    )
    tipo_movimiento = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO_CHOICES)
    tipo_entidad = models.CharField(max_length=30)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    turno = models.ForeignKey(
        'Turno',
        on_delete=models.CASCADE,
        related_name='historial_uso'
    )
    registro_acceso = models.ForeignKey(
        'RegistroAcceso',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='historial_uso'
    )
    dentro_instalacion = models.BooleanField(default=False)
    observaciones = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Historial de Uso de Vehículo'
        verbose_name_plural = 'Historiales de Uso de Vehículos'
        indexes = [
            models.Index(fields=['vehiculo', 'dentro_instalacion']),
            models.Index(fields=['fecha_hora']),
        ]

    def __str__(self):
        estado = 'DENTRO' if self.dentro_instalacion else 'FUERA'
        return f"{self.vehiculo.placa} - {self.get_tipo_movimiento_display()} - {self.fecha_hora} ({estado})"

    @classmethod
    def get_vehiculos_dentro(cls):
        """Retorna todos los vehículos que están dentro de la instalación"""
        return cls.objects.filter(dentro_instalacion=True)

    @classmethod
    def get_por_vehiculo(cls, vehiculo_id, limite=50):
        """Retorna el historial de un vehículo específico"""
        return cls.objects.filter(vehiculo_id=vehiculo_id).order_by('-fecha_hora')[:limite]


class BitacoraCambios(models.Model):
    """
    Bitácora de auditoría - registra todos los cambios en el sistema.
    Incluye asignaciones, desasignaciones, logins, logouts, etc.
    """
    ACCION_CHOICES = [
        ('INSERT', 'Inserción'),
        ('UPDATE', 'Actualización'),
        ('DELETE', 'Eliminación'),
        ('ASIGNAR', 'Asignación'),
        ('DESASIGNAR', 'Desasignación'),
        ('LOGIN', 'Inicio de sesión'),
        ('LOGOUT', 'Cierre de sesión'),
        ('REGISTRO_ENTRADA', 'Registro de entrada'),
        ('REGISTRO_SALIDA', 'Registro de salida'),
    ]

    tabla_affectada = models.CharField(max_length=100)
    registro_id = models.PositiveIntegerField()
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES)
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bitacora_cambios'
    )
    datos_anteriores = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Bitácora de Cambio'
        verbose_name_plural = 'Bitácoras de Cambios'
        indexes = [
            models.Index(fields=['tabla_affectada', 'registro_id']),
            models.Index(fields=['fecha_hora']),
            models.Index(fields=['usuario']),
        ]

    def __str__(self):
        return f"{self.fecha_hora} - {self.accion} en {self.tabla_affectada} (ID:{self.registro_id})"

    @classmethod
    def registrar(cls, tabla, registro_id, accion, usuario, datos_anteriores=None, datos_nuevos=None, ip=None, user_agent=None):
        """Método удобный para registrar un cambio en la bitácora"""
        return cls.objects.create(
            tabla_affectada=tabla,
            registro_id=registro_id,
            accion=accion,
            usuario=usuario,
            datos_anteriores=datos_anteriores,
            datos_nuevos=datos_nuevos,
            ip_address=ip,
            user_agent=user_agent
        )


# =========================
# AUDITORÍA ANTERIOR / COMPATIBILIDAD
# =========================

class AuditoriaEvento(models.Model):
    TIPO_EVENTO_CHOICES = [
        ('login', 'Inicio de sesión'),
        ('logout', 'Cierre de sesión'),
        ('turno_apertura', 'Apertura de turno'),
        ('turno_cierre', 'Cierre de turno'),
        ('registro_acceso', 'Registro de acceso'),
        ('checklist', 'Registro de checklist'),
        ('admin_accion', 'Acción administrativa'),
        ('notificacion', 'Notificación'),
    ]

    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='eventos_auditoria'
    )
    tipo_evento = models.CharField(max_length=30, choices=TIPO_EVENTO_CHOICES)
    descripcion = models.TextField()
    referencia_modelo = models.CharField(max_length=100, blank=True)
    referencia_id = models.PositiveIntegerField(blank=True, null=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    ip = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha_hora']

    def save(self, *args, **kwargs):
        self.descripcion = (self.descripcion or '').strip()
        self.referencia_modelo = (self.referencia_modelo or '').strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_tipo_evento_display()} - {self.fecha_hora}"


# =========================
# NOTIFICACIONES PUSH
# =========================

class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('turno_abierto', 'Turno abierto'),
        ('turno_cerrado', 'Turno cerrado'),
        ('alerta', 'Alerta'),
        ('recordatorio', 'Recordatorio'),
        ('info', 'Información'),
    ]

    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, default='info')
    leida = models.BooleanField(default=False)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.usuario.username} - {self.titulo}"