import sys
from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    UserProfile,
    Empleado,
    Conductor,
    Vehiculo,
    AsignacionVehiculoEmpleado,
    AsignacionConductorVehiculo,
    AsignacionEmpleadoVehiculo,
    HistorialUsoVehiculo,
    BitacoraCambios,
    VisitanteRegistro,
    Turno,
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
    Notificacion,
)


# =========================
# USUARIO / PERFIL
# =========================

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'role',
            'full_name',
            'phone',
            'photo',
            'is_active_user',
        ]


# =========================
# TURNOS
# =========================

class TurnoSerializer(serializers.ModelSerializer):
    guardia_username = serializers.CharField(source='guardia.username', read_only=True)
    guardia_email = serializers.EmailField(source='guardia.email', read_only=True)
    tipo_turno_display = serializers.CharField(source='get_tipo_turno_display', read_only=True)
    observaciones = serializers.CharField(
        max_length=200, required=False, allow_blank=True,
        error_messages={'max_length': 'Las observaciones deben tener máximo 200 caracteres'}
    )
    observaciones_cierre = serializers.CharField(
        max_length=200, required=False, allow_blank=True,
        error_messages={'max_length': 'Las observaciones de cierre deben tener máximo 200 caracteres'}
    )

    class Meta:
        model = Turno
        fields = [
            'id',
            'guardia',
            'guardia_username',
            'guardia_email',
            'tipo_turno',
            'tipo_turno_display',
            'fecha',
            'hora_apertura',
            'hora_cierre',
            'abierto',
            'observaciones',
            'observaciones_cierre',
            'firma_cierre',
        ]
        read_only_fields = ['guardia', 'hora_apertura', 'hora_cierre', 'abierto']


# =========================
# CATÁLOGOS BASE
# =========================

class EmpleadoSerializer(serializers.ModelSerializer):
    numero_empleado = serializers.CharField(
        max_length=30,
        min_length=1,
        required=True,
        error_messages={
            'max_length': 'El número de empleado debe tener máximo 30 caracteres',
            'min_length': 'El número de empleado es requerido',
            'blank': 'El número de empleado es requerido',
        }
    )
    nombre_completo = serializers.CharField(max_length=150, required=True)

    vehiculo_asignado = serializers.SerializerMethodField()

    class Meta:
        model = Empleado
        fields = [
            'id',
            'numero_empleado',
            'nombre_completo',
            'departamento',
            'puesto',
            'activo',
            'vehiculo_asignado',
        ]

    def get_vehiculo_asignado(self, obj):
        try:
            from platform_core.models import AsignacionVehiculoEmpleado
            asignacion = AsignacionVehiculoEmpleado.objects.filter(
                empleado=obj, activa=True
            ).select_related('vehiculo').first()
            if asignacion and asignacion.vehiculo:
                return {
                    'id': asignacion.vehiculo.id,
                    'placa': asignacion.vehiculo.placa,
                    'marca': asignacion.vehiculo.marca,
                    'modelo': asignacion.vehiculo.modelo,
                }
        except Exception:
            pass
        return None


class ConductorSerializer(serializers.ModelSerializer):
    licencia = serializers.CharField(
        max_length=50,
        min_length=0,
        required=False,
        allow_blank=True,
        error_messages={
            'max_length': 'La licencia debe tener máximo 50 caracteres',
        }
    )
    nombre_completo = serializers.CharField(max_length=150)
    vehiculo_info = serializers.SerializerMethodField()

    class Meta:
        model = Conductor
        fields = [
            'id',
            'nombre_completo',
            'licencia',
            'telefono',
            'empresa',
            'activo',
            'vehiculo',
            'vehiculo_info',
        ]

    def get_vehiculo_info(self, obj):
        try:
            if obj.vehiculo_id:
                vehiculo = Vehiculo.objects.get(pk=obj.vehiculo_id)
                return {
                    'id': vehiculo.id,
                    'placa': vehiculo.placa,
                    'clave_interna': vehiculo.clave_interna,
                    'marca': vehiculo.marca,
                    'modelo': vehiculo.modelo,
                }
        except Exception:
            pass
        return None


class VehiculoSerializer(serializers.ModelSerializer):
    tipo_entidad_display = serializers.CharField(source='get_tipo_entidad_display', read_only=True)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    placa = serializers.CharField(
        max_length=20,
        min_length=1,
        required=True,
        error_messages={
            'max_length': 'La placa debe tener máximo 20 caracteres',
            'min_length': 'La placa es requerida',
            'blank': 'La placa es requerida',
        }
    )
    clave_interna = serializers.CharField(max_length=20, required=False, allow_blank=True)
    marca = serializers.CharField(max_length=80, required=False, allow_blank=True)
    modelo = serializers.CharField(max_length=80, required=False, allow_blank=True)
    conductor_actual_info = serializers.SerializerMethodField()
    ultimo_empleado_info = serializers.SerializerMethodField()

    class Meta:
        model = Vehiculo
        fields = [
            'id',
            'clave_interna',
            'placa',
            'tipo_entidad',
            'tipo_entidad_display',
            'categoria',
            'categoria_display',
            'propietario',
            'empresa',
            'marca',
            'modelo',
            'color',
            'numero_economico',
            'activo',
            'requiere_checklist',
            'observaciones',
            'en_instalacion',
            'conductor_actual',
            'conductor_actual_info',
            'ultimo_empleado',
            'ultimo_empleado_info',
        ]

    def get_conductor_actual_info(self, obj):
        try:
            if obj.conductor_actual_id:
                return {
                    'id': obj.conductor_actual.id,
                    'nombre_completo': obj.conductor_actual.nombre_completo,
                }
        except Exception:
            pass
        return None

    def get_ultimo_empleado_info(self, obj):
        try:
            if obj.ultimo_empleado_id:
                return {
                    'id': obj.ultimo_empleado.id,
                    'nombre_completo': obj.ultimo_empleado.nombre_completo,
                    'numero_empleado': obj.ultimo_empleado.numero_empleado,
                }
        except Exception:
            pass
        return None


class AsignacionVehiculoEmpleadoSerializer(serializers.ModelSerializer):
    vehiculo_info = VehiculoSerializer(source='vehiculo', read_only=True)
    empleado_info = EmpleadoSerializer(source='empleado', read_only=True)

    class Meta:
        model = AsignacionVehiculoEmpleado
        fields = [
            'id',
            'vehiculo',
            'vehiculo_info',
            'empleado',
            'empleado_info',
            'activa',
            'fecha_asignacion',
        ]


class VisitanteRegistroSerializer(serializers.ModelSerializer):
    tipo_visitante_display = serializers.CharField(source='get_tipo_visitante_display', read_only=True)

    class Meta:
        model = VisitanteRegistro
        fields = [
            'id',
            'tipo_visitante',
            'tipo_visitante_display',
            'nombre_completo',
            'empresa',
            'vehiculo_tipo_general',
            'placas',
            'motivo',
            'observaciones',
        ]


# =========================
# PLANTILLAS CHECKLIST GENERAL
# =========================

class PlantillaChecklistItemSerializer(serializers.ModelSerializer):
    tipo_respuesta_display = serializers.CharField(source='get_tipo_respuesta_display', read_only=True)

    class Meta:
        model = PlantillaChecklistItem
        fields = [
            'id',
            'plantilla',
            'nombre',
            'descripcion',
            'obligatorio',
            'tipo_respuesta',
            'tipo_respuesta_display',
            'orden',
        ]


class PlantillaChecklistSerializer(serializers.ModelSerializer):
    items = PlantillaChecklistItemSerializer(many=True, read_only=True)
    tipo_entidad_display = serializers.CharField(source='get_tipo_entidad_display', read_only=True)
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)

    class Meta:
        model = PlantillaChecklist
        fields = [
            'id',
            'nombre',
            'tipo_entidad',
            'tipo_entidad_display',
            'categoria',
            'categoria_display',
            'activa',
            'items',
        ]


# =========================
# REGISTRO DE ACCESO
# =========================

class RegistroAccesoSerializer(serializers.ModelSerializer):
    guardia_username = serializers.CharField(source='guardia.username', read_only=True)

    tipo_movimiento_display = serializers.CharField(source='get_tipo_movimiento_display', read_only=True)
    tipo_entidad_display = serializers.CharField(source='get_tipo_entidad_display', read_only=True)

    observaciones = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        error_messages={
            'max_length': 'Las observaciones deben tener máximo 200 caracteres',
        }
    )

    turno_info = TurnoSerializer(source='turno', read_only=True)
    vehiculo_info = VehiculoSerializer(source='vehiculo', read_only=True)
    empleado_info = EmpleadoSerializer(source='empleado', read_only=True)
    conductor_info = ConductorSerializer(source='conductor', read_only=True)
    visitante_info = VisitanteRegistroSerializer(source='visitante', read_only=True)
    entrada_asociada_info = serializers.SerializerMethodField()

    evidencia_fotografica = serializers.ImageField(required=False, allow_null=True, read_only=True)
    conductor_pendiente_salida = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = RegistroAcceso
        fields = [
            'id',
            'turno',
            'turno_info',
            'guardia',
            'guardia_username',
            'tipo_movimiento',
            'tipo_movimiento_display',
            'tipo_entidad',
            'tipo_entidad_display',
            'vehiculo',
            'vehiculo_info',
            'empleado',
            'empleado_info',
            'conductor',
            'conductor_info',
            'visitante',
            'visitante_info',
            'fecha_hora',
            'observaciones',
            'requiere_evidencia',
            'tiene_evidencia',
            'evidencia_fotografica',
            'checklist_requerido',
            'checklist_realizado',
            'conductor_pendiente_salida',
            'entrada_asociada',
            'entrada_asociada_info',
        ]
        extra_kwargs = {
            'guardia': {'read_only': True},
            'fecha_hora': {'read_only': True},
            'tiene_evidencia': {'read_only': True},
            'checklist_requerido': {'read_only': True},
            'conductor_pendiente_salida': {'read_only': False},
            'entrada_asociada': {'read_only': False, 'required': False},
        }

    def get_entrada_asociada_info(self, obj):
        if obj.entrada_asociada:
            return {
                'id': obj.entrada_asociada.id,
                'fecha_hora': obj.entrada_asociada.fecha_hora,
                'vehiculo_placa': obj.entrada_asociada.vehiculo.placa if obj.entrada_asociada.vehiculo else None,
                'conductor_nombre': obj.entrada_asociada.conductor.nombre_completo if obj.entrada_asociada.conductor else None,
            }
        return None

    def create(self, validated_data):
        conductor_pendiente = validated_data.pop('conductor_pendiente_salida', False)
        if conductor_pendiente in (True, 'True', 'true', '1', 1):
            conductor_pendiente = True
        else:
            conductor_pendiente = False
        registro = RegistroAcceso.objects.create(**validated_data)
        if conductor_pendiente:
            registro.conductor_pendiente_salida = True
            registro.save(update_fields=['conductor_pendiente_salida'])
        return registro


# =========================
# CHECKLIST GENERAL
# =========================

class ChecklistItemResultadoSerializer(serializers.ModelSerializer):
    item_nombre = serializers.CharField(source='item_plantilla.nombre', read_only=True)
    item_info = PlantillaChecklistItemSerializer(source='item_plantilla', read_only=True)

    class Meta:
        model = ChecklistItemResultado
        fields = [
            'id',
            'checklist',
            'item_plantilla',
            'item_nombre',
            'item_info',
            'valor_booleano',
            'valor_texto',
            'observacion',
        ]


class ChecklistRegistroSerializer(serializers.ModelSerializer):
    registro_info = RegistroAccesoSerializer(source='registro_acceso', read_only=True)
    plantilla_info = PlantillaChecklistSerializer(source='plantilla', read_only=True)
    registrado_por_username = serializers.CharField(source='registrado_por.username', read_only=True)
    resultado_general_display = serializers.CharField(source='get_resultado_general_display', read_only=True)
    resultados = ChecklistItemResultadoSerializer(many=True, read_only=True)

    class Meta:
        model = ChecklistRegistro
        fields = [
            'id',
            'registro_acceso',
            'registro_info',
            'plantilla',
            'plantilla_info',
            'registrado_por',
            'registrado_por_username',
            'resultado_general',
            'resultado_general_display',
            'observaciones_generales',
            'fecha_hora',
            'resultados',
        ]
        read_only_fields = [
            'registrado_por',
            'fecha_hora',
        ]


# =========================
# EVIDENCIAS
# =========================

class EvidenciaSerializer(serializers.ModelSerializer):
    capturada_por_username = serializers.CharField(source='capturada_por.username', read_only=True)

    class Meta:
        model = Evidencia
        fields = [
            'id',
            'registro_acceso',
            'checklist',
            'archivo',
            'descripcion',
            'capturada_por',
            'capturada_por_username',
            'fecha_hora',
        ]
        read_only_fields = [
            'capturada_por',
            'fecha_hora',
        ]


# =========================
# AUDITORÍA ANTERIOR
# =========================

class AuditoriaEventoSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = AuditoriaEvento
        fields = [
            'id',
            'usuario',
            'usuario_username',
            'tipo_evento',
            'descripcion',
            'referencia_modelo',
            'referencia_id',
            'fecha_hora',
            'ip',
        ]


# =========================
# CHECKLIST TRACTO
# =========================

class ChecklistTractoItemCatalogoSerializer(serializers.ModelSerializer):
    seccion_display = serializers.CharField(source='get_seccion_display', read_only=True)

    class Meta:
        model = ChecklistTractoItemCatalogo
        fields = [
            'id',
            'codigo',
            'seccion',
            'seccion_display',
            'nombre',
            'orden',
            'activo',
        ]


class ChecklistTractoResultadoSerializer(serializers.ModelSerializer):
    item_info = ChecklistTractoItemCatalogoSerializer(source='item', read_only=True)
    valor_display = serializers.CharField(source='get_valor_display', read_only=True)

    class Meta:
        model = ChecklistTractoResultado
        fields = [
            'id',
            'item',
            'item_info',
            'valor',
            'valor_display',
            'observacion',
        ]


class ChecklistTractoLlantaSerializer(serializers.ModelSerializer):
    posicion_display = serializers.CharField(source='get_posicion_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = ChecklistTractoLlanta
        fields = [
            'id',
            'posicion',
            'posicion_display',
            'estado',
            'estado_display',
            'observacion',
        ]


class ChecklistTractoEvidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistTractoEvidencia
        fields = [
            'id',
            'imagen',
            'descripcion',
            'uuid_evidencia',
        ]
        read_only_fields = [
            'uuid_evidencia',
        ]


class ChecklistTractoSerializer(serializers.ModelSerializer):
    guardia_username = serializers.CharField(source='guardia.username', read_only=True)

    vehiculo_info = VehiculoSerializer(source='vehiculo', read_only=True)
    conductor_info = ConductorSerializer(source='conductor', read_only=True)
    registro_acceso_info = RegistroAccesoSerializer(source='registro_acceso', read_only=True)
    turno_info = TurnoSerializer(source='turno', read_only=True)

    estatus_general_display = serializers.CharField(source='get_estatus_general_display', read_only=True)

    resultados = ChecklistTractoResultadoSerializer(many=True, read_only=True)
    llantas = ChecklistTractoLlantaSerializer(many=True, read_only=True)
    evidencias = ChecklistTractoEvidenciaSerializer(many=True, read_only=True)

    class Meta:
        model = ChecklistTracto
        fields = [
            'id',
            'registro_acceso',
            'registro_acceso_info',
            'turno',
            'turno_info',
            'guardia',
            'guardia_username',
            'vehiculo',
            'vehiculo_info',
            'conductor',
            'conductor_info',
            'fecha_hora',
            'estatus_general',
            'estatus_general_display',
            'observaciones_generales',
            'firma_operador_data',
            'firma_vigilante_data',
            'resultados',
            'llantas',
            'evidencias',
        ]
        read_only_fields = [
            'turno',
            'guardia',
            'vehiculo',
            'conductor',
            'fecha_hora',
        ]


class ChecklistTractoCreateSerializer(serializers.Serializer):
    registro_acceso = serializers.IntegerField()
    estatus_general = serializers.ChoiceField(choices=ChecklistTracto.ESTATUS_GENERAL_CHOICES)
    observaciones_generales = serializers.CharField(
        required=False, allow_blank=True, max_length=200,
        error_messages={'max_length': 'Las observaciones deben tener máximo 200 caracteres'}
    )
    firma_operador_data = serializers.CharField(required=False, allow_blank=True)
    firma_vigilante_data = serializers.CharField(required=False, allow_blank=True)
    resultados = serializers.ListField(required=False)
    llantas = serializers.ListField(required=False)

    def validate(self, attrs):
        registro_id = attrs.get('registro_acceso')

        try:
            registro = RegistroAcceso.objects.select_related(
                'turno',
                'guardia',
                'vehiculo',
                'conductor'
            ).get(pk=registro_id)
        except RegistroAcceso.DoesNotExist:
            raise serializers.ValidationError({
                'registro_acceso': 'Registro de acceso no encontrado.'
            })

        if registro.tipo_entidad != 'tracto':
            raise serializers.ValidationError({
                'registro_acceso': 'El checklist solo aplica para registros de tracto.'
            })

        if hasattr(registro, 'checklist_tracto'):
            raise serializers.ValidationError({
                'registro_acceso': 'Este registro ya tiene checklist de tracto.'
            })

        if not registro.vehiculo:
            raise serializers.ValidationError({
                'vehiculo': 'El registro no tiene vehículo asociado.'
            })

        if registro.vehiculo.tipo_entidad != 'tracto':
            raise serializers.ValidationError({
                'vehiculo': 'El vehículo asociado no es un tractocamión.'
            })

        attrs['registro_obj'] = registro
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')

        registro = validated_data.pop('registro_obj')
        resultados = validated_data.pop('resultados', [])
        llantas = validated_data.pop('llantas', [])

        evidencias = []
        if request:
            evidencias = request.FILES.getlist('evidencias')

        checklist = ChecklistTracto.objects.create(
            registro_acceso=registro,
            turno=registro.turno,
            guardia=registro.guardia,
            vehiculo=registro.vehiculo,
            conductor=registro.conductor,
            estatus_general=validated_data.get('estatus_general'),
            observaciones_generales=validated_data.get('observaciones_generales', ''),
            firma_operador_data=validated_data.get('firma_operador_data', ''),
            firma_vigilante_data=validated_data.get('firma_vigilante_data', ''),
        )

        for resultado in resultados:
            item_id = resultado.get('item')
            valor = resultado.get('valor')
            observacion = resultado.get('observacion', '')

            if item_id and valor:
                ChecklistTractoResultado.objects.create(
                    checklist=checklist,
                    item_id=item_id,
                    valor=valor,
                    observacion=observacion,
                )

        for llanta in llantas:
            posicion = llanta.get('posicion')
            estado = llanta.get('estado')
            observacion = llanta.get('observacion', '')

            if posicion and estado:
                ChecklistTractoLlanta.objects.create(
                    checklist=checklist,
                    posicion=posicion,
                    estado=estado,
                    observacion=observacion,
                )

        for img in evidencias:
            ChecklistTractoEvidencia.objects.create(
                checklist=checklist,
                imagen=img,
                descripcion=''
            )

        registro.checklist_realizado = True
        registro.save(update_fields=['checklist_realizado'])

        return checklist


# =========================
# AUDITORÍA ACTUAL
# =========================

class AuditLogSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    modulo_display = serializers.CharField(source='get_modulo_display', read_only=True)
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'fecha_hora',
            'usuario',
            'usuario_username',
            'modulo',
            'modulo_display',
            'accion',
            'accion_display',
            'descripcion',
            'entidad_tipo',
            'entidad_id',
            'turno',
        ]


# =========================
# ASIGNACIONES NORMALIZADAS
# =========================

class AsignacionConductorVehiculoSerializer(serializers.ModelSerializer):
    conductor_nombre = serializers.CharField(source='conductor.nombre_completo', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    vehiculo_marca = serializers.CharField(source='vehiculo.marca', read_only=True)

    class Meta:
        model = AsignacionConductorVehiculo
        fields = [
            'id',
            'conductor',
            'conductor_nombre',
            'vehiculo',
            'vehiculo_placa',
            'vehiculo_marca',
            'activa',
            'fecha_asignacion',
            'fecha_desasignacion',
            'observaciones',
        ]
        read_only_fields = ['fecha_asignacion', 'fecha_desasignacion']


class AsignacionEmpleadoVehiculoSerializer(serializers.ModelSerializer):
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    vehiculo_marca = serializers.CharField(source='vehiculo.marca', read_only=True)

    class Meta:
        model = AsignacionEmpleadoVehiculo
        fields = [
            'id',
            'empleado',
            'empleado_nombre',
            'vehiculo',
            'vehiculo_placa',
            'vehiculo_marca',
            'activa',
            'fecha_asignacion',
            'fecha_desasignacion',
            'observaciones',
        ]
        read_only_fields = ['fecha_asignacion', 'fecha_desasignacion']


class HistorialUsoVehiculoSerializer(serializers.ModelSerializer):
    vehiculo_placa = serializers.CharField(source='vehiculo.placa', read_only=True)
    conductor_nombre = serializers.CharField(source='conductor.nombre_completo', read_only=True)
    empleado_nombre = serializers.CharField(source='empleado.nombre_completo', read_only=True)
    tipo_movimiento_display = serializers.CharField(read_only=True)
    dentro_instalacion_display = serializers.SerializerMethodField()

    class Meta:
        model = HistorialUsoVehiculo
        fields = [
            'id',
            'vehiculo',
            'vehiculo_placa',
            'conductor',
            'conductor_nombre',
            'empleado',
            'empleado_nombre',
            'visitante',
            'tipo_movimiento',
            'tipo_movimiento_display',
            'tipo_entidad',
            'fecha_hora',
            'turno',
            'registro_acceso',
            'dentro_instalacion',
            'dentro_instalacion_display',
            'observaciones',
        ]

    def get_dentro_instalacion_display(self, obj):
        return 'DENTRO' if obj.dentro_instalacion else 'FUERA'


class BitacoraCambiosSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)

    class Meta:
        model = BitacoraCambios
        fields = [
            'id',
            'tabla_affectada',
            'registro_id',
            'accion',
            'accion_display',
            'usuario',
            'usuario_username',
            'datos_anteriores',
            'datos_nuevos',
            'ip_address',
            'fecha_hora',
        ]


# =========================
# NOTIFICACIONES PUSH
# =========================

class NotificacionSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'usuario',
            'titulo',
            'mensaje',
            'tipo',
            'tipo_display',
            'leida',
            'fecha_hora',
            'link',
        ]


class NotificacionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['titulo', 'mensaje', 'tipo', 'link']