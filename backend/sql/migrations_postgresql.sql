-- ============================================
-- SCRIPT SQL: CHECKLIST VEHICULAR
-- Base de Datos Normalizada para PostgreSQL
-- ============================================
-- Ejecutar con: psql -U postgres -d checklist_vehicular -f nombre_archivo.sql
-- ============================================

-- ============================================
-- 1. ASIGNACIONES CONDUCTOR-VEHICULO
-- ============================================
CREATE TABLE IF NOT EXISTS asignacion_conductor_vehiculo (
    id SERIAL PRIMARY KEY,
    conductor_id INTEGER NOT NULL REFERENCES conductor(id) ON DELETE CASCADE,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculo(id) ON DELETE CASCADE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_asignacion_conductor_activa
        UNIQUE (conductor_id, activa)
        WHERE activa = TRUE
);

CREATE INDEX IF NOT EXISTS idx_asignacion_conductor_activa
    ON asignacion_conductor_vehiculo(activa) WHERE activa = TRUE;
CREATE INDEX IF NOT EXISTS idx_asignacion_conductor_conductor
    ON asignacion_conductor_vehiculo(conductor_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_conductor_vehiculo
    ON asignacion_conductor_vehiculo(vehiculo_id);

COMMENT ON TABLE asignacion_conductor_vehiculo IS 'Tabla de asignaciones formales entre conductores y vehículos tractocamión';
COMMENT ON COLUMN asignacion_conductor_vehiculo.conductor_id IS 'Conductor asignado al vehículo';
COMMENT ON COLUMN asignacion_conductor_vehiculo.vehiculo_id IS 'Vehículo tractocamión asignado';
COMMENT ON COLUMN asignacion_conductor_vehiculo.activa IS 'TRUE si la asignación está activa actualmente';
COMMENT ON COLUMN asignacion_conductor_vehiculo.fecha_desasignacion IS 'Fecha en que se desactivó la asignación (NULL si está activa)';

-- ============================================
-- 2. ASIGNACIONES EMPLEADO-VEHICULO (MEJORADA)
-- ============================================
CREATE TABLE IF NOT EXISTS asignacion_empleado_vehiculo (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculo(id) ON DELETE CASCADE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asignacion_empleado_activa
    ON asignacion_empleado_vehiculo(activa) WHERE activa = TRUE;
CREATE INDEX IF NOT EXISTS idx_asignacion_empleado_empleado
    ON asignacion_empleado_vehiculo(empleado_id);
CREATE INDEX IF NOT EXISTS idx_asignacion_empleado_vehiculo
    ON asignacion_empleado_vehiculo(vehiculo_id);

COMMENT ON TABLE asignacion_empleado_vehiculo IS 'Tabla de asignaciones formales entre empleados y vehículos de empresa';

-- ============================================
-- 3. HISTORIAL USO VEHÍCULO
-- ============================================
CREATE TABLE IF NOT EXISTS historial_uso_vehiculo (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER NOT NULL REFERENCES vehiculo(id) ON DELETE CASCADE,
    conductor_id INTEGER NULL REFERENCES conductor(id) ON DELETE SET NULL,
    empleado_id INTEGER NULL REFERENCES empleado(id) ON DELETE SET NULL,
    visitante_id INTEGER NULL REFERENCES visitante_registro(id) ON DELETE SET NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida')),
    tipo_entidad VARCHAR(30) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    turno_id INTEGER NOT NULL REFERENCES turno(id) ON DELETE CASCADE,
    registro_acceso_id INTEGER NULL REFERENCES registro_acceso(id) ON DELETE SET NULL,
    dentro_instalacion BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_historial_uso_vehiculo_vehiculo
    ON historial_uso_vehiculo(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_historial_uso_vehiculo_dentro
    ON historial_uso_vehiculo(dentro_instalacion) WHERE dentro_instalacion = TRUE;
CREATE INDEX IF NOT EXISTS idx_historial_uso_vehiculo_fecha
    ON historial_uso_vehiculo(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_historial_uso_vehiculo_conductor
    ON historial_uso_vehiculo(conductor_id) WHERE conductor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_historial_uso_vehiculo_empleado
    ON historial_uso_vehiculo(empleado_id) WHERE empleado_id IS NOT NULL;

COMMENT ON TABLE historial_uso_vehiculo IS 'Historial completo de uso de vehículos - quién entró/salió y cuándo';
COMMENT ON COLUMN historial_uso_vehiculo.dentro_instalacion IS 'TRUE si el vehículo está actualmente dentro de la instalación';
COMMENT ON COLUMN historial_uso_vehiculo.registro_acceso_id IS 'Referencia al RegistroAcceso correspondiente';

-- ============================================
-- 4. BITÁCORA DE CAMBIOS (AUDIT LOG)
-- ============================================
CREATE TABLE IF NOT EXISTS bitacora_cambios (
    id SERIAL PRIMARY KEY,
    tabla_affectada VARCHAR(100) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'ASIGNAR', 'DESASIGNAR', 'LOGIN', 'LOGOUT')),
    usuario_id INTEGER NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    datos_anteriores JSONB NULL,
    datos_nuevos JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bitacora_cambios_tabla
    ON bitacora_cambios(tabla_affectada);
CREATE INDEX IF NOT EXISTS idx_bitacora_cambios_fecha
    ON bitacora_cambios(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_cambios_usuario
    ON bitacora_cambios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_cambios_registro
    ON bitacora_cambios(tabla_affectada, registro_id);

COMMENT ON TABLE bitacora_cambios IS 'Bitácora de auditoría - registra todos los cambios en el sistema';
COMMENT ON COLUMN bitacora_cambios.accion IS 'Tipo de acción: INSERT, UPDATE, DELETE, ASIGNAR, DESASIGNAR, LOGIN, LOGOUT';
COMMENT ON COLUMN bitacora_cambios.datos_anteriores IS 'Estado anterior del registro (JSON)';
COMMENT ON COLUMN bitacora_cambios.datos_nuevos IS 'Estado nuevo del registro (JSON)';

-- ============================================
-- 5. MODIFICACIÓN: REGISTRO ACCESO (agregar ParId)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'registro_acceso' AND column_name = 'par_id'
    ) THEN
        ALTER TABLE registro_acceso ADD COLUMN par_id UUID NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_registro_acceso_par_id
    ON registro_acceso(par_id) WHERE par_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registro_acceso_fecha
    ON registro_acceso(fecha_hora DESC);

-- ============================================
-- 6. FUNCTION: Registro en bitácora
-- ============================================
CREATE OR REPLACE FUNCTION fnRegistrarBitacora(
    p_tabla VARCHAR,
    p_registro_id INTEGER,
    p_accion VARCHAR,
    p_usuario_id INTEGER,
    p_datos_anteriores JSONB DEFAULT NULL,
    p_datos_nuevos JSONB DEFAULT NULL,
    p_ip_address VARCHAR DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO bitacora_cambios (
        tabla_affectada, registro_id, accion, usuario_id,
        datos_anteriores, datos_nuevos, ip_address, user_agent
    ) VALUES (
        p_tabla, p_registro_id, p_accion, p_usuario_id,
        p_datos_anteriores, p_datos_nuevos, p_ip_address, p_user_agent
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VISTAS ÚTILES PARA CONSULTAS
-- ============================================

-- Vista: Vehículos actualmente dentro
CREATE OR REPLACE VIEW v_vehiculos_dentro AS
SELECT
    h.id AS historial_id,
    v.id AS vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    v.clave_interna,
    c.id AS conductor_id,
    c.nombre_completo AS conductor_nombre,
    e.id AS empleado_id,
    e.nombre_completo AS empleado_nombre,
    h.tipo_entidad,
    h.fecha_hora AS fecha_entrada,
    t.id AS turno_id,
    t.tipo_turno,
    u.first_name AS guardia_nombre
FROM historial_uso_vehiculo h
JOIN vehiculo v ON h.vehiculo_id = v.id
JOIN turno t ON h.turno_id = t.id
JOIN auth_user u ON t.guardia_id = u.id
LEFT JOIN conductor c ON h.conductor_id = c.id
LEFT JOIN empleado e ON h.empleado_id = e.id
WHERE h.dentro_instalacion = TRUE;

-- Vista: Conductor vehiculo asignaciones activas
CREATE OR REPLACE VIEW v_asignaciones_conductor_activas AS
SELECT
    a.id AS asignacion_id,
    c.id AS conductor_id,
    c.nombre_completo AS conductor_nombre,
    c.numero_licencia,
    v.id AS vehiculo_id,
    v.placa,
    v.marca,
    v.modelo,
    a.fecha_asignacion
FROM asignacion_conductor_vehiculo a
JOIN conductor c ON a.conductor_id = c.id
JOIN vehiculo v ON a.vehiculo_id = v.id
WHERE a.activa = TRUE AND a.fecha_desasignacion IS NULL;

-- Vista: Bitácora reciente
CREATE OR REPLACE VIEW v_bitacora_reciente AS
SELECT
    b.id,
    b.fecha_hora,
    b.tabla_affectada,
    b.accion,
    b.registro_id,
    u.username,
    u.first_name,
    u.last_name
FROM bitacora_cambios b
JOIN auth_user u ON b.usuario_id = u.id
ORDER BY b.fecha_hora DESC
LIMIT 100;

-- ============================================
-- 8. CONSULTAS DE EJEMPLO PARA ADMIN
-- ============================================

-- Q1: Ver todos los vehículos DENTRO de la instalación
-- SELECT * FROM v_vehiculos_dentro;

-- Q2: Ver historial de un vehículo específico (reemplazar 12 por el ID)
-- SELECT * FROM historial_uso_vehiculo WHERE vehiculo_id = 12 ORDER BY fecha_hora DESC LIMIT 50;

-- Q3: Ver conductores asignados a un vehículo
-- SELECT c.nombre_completo, a.fecha_asignacion FROM asignacion_conductor_vehiculo a
-- JOIN conductor c ON a.conductor_id = c.id
-- WHERE a.vehiculo_id = 12 AND a.activa = TRUE;

-- Q4: Ver todas las entradas/salidas de HOY
-- SELECT r.tipo_movimiento, r.tipo_entidad, v.placa, c.nombre_completo, r.fecha_hora
-- FROM registro_acceso r
-- LEFT JOIN vehiculo v ON r.vehiculo_id = v.id
-- LEFT JOIN conductor c ON r.conductor_id = c.id
-- WHERE DATE(r.fecha_hora) = CURRENT_DATE
-- ORDER BY r.fecha_hora DESC;

-- Q5: Ver conductores SIN vehículo asignado (disponibles)
-- SELECT c.nombre_completo, c.numero_licencia FROM conductor c
-- WHERE c.activo = TRUE
-- AND c.id NOT IN (
--     SELECT conductor_id FROM asignacion_conductor_vehiculo
--     WHERE activa = TRUE AND fecha_desasignacion IS NULL
-- );

-- Q6: Ver pendientes de salida
-- SELECT v.placa, c.nombre_completo AS conductor, h.fecha_hora AS hora_entrada
-- FROM historial_uso_vehiculo h
-- JOIN vehiculo v ON h.vehiculo_id = v.id
-- JOIN conductor c ON h.conductor_id = c.id
-- WHERE h.dentro_instalacion = TRUE
-- ORDER BY h.fecha_hora;

-- Q7: Ver bitácora de cambios de asignaciones
-- SELECT b.fecha_hora, b.accion, b.tabla_affectada, u.username
-- FROM bitacora_cambios b
-- JOIN auth_user u ON b.usuario_id = u.id
-- WHERE b.tabla_affectada LIKE '%asignacion%'
-- ORDER BY b.fecha_hora DESC LIMIT 20;

-- Q8: Registro de acceso con ParId (entradas y salidas vinculadas)
-- SELECT
--     r_entrada.id AS entrada_id,
--     r_entrada.fecha_hora AS hora_entrada,
--     r_salida.id AS salida_id,
--     r_salida.fecha_hora AS hora_salida,
--     v.placa,
--     c.nombre_completo AS conductor,
--     r_entrada.par_id
-- FROM registro_acceso r_entrada
-- LEFT JOIN registro_acceso r_salida ON r_entrada.par_id = r_salida.par_id AND r_salida.tipo_movimiento = 'salida'
-- LEFT JOIN vehiculo v ON r_entrada.vehiculo_id = v.id
-- LEFT JOIN conductor c ON r_entrada.conductor_id = c.id
-- WHERE r_entrada.tipo_movimiento = 'entrada'
-- ORDER BY r_entrada.fecha_hora DESC LIMIT 50;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Ejecutar migraciones Django después:
-- python manage.py makemigrations
-- python manage.py migrate
-- ============================================