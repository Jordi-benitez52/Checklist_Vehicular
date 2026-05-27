# CAPÍTULO I: INTRODUCCIÓN

---

## 1.1 Justificación

El control de accesos vehiculares en instalaciones industriales y-logísticas representa un desafío operativo crítico para empresas como Logística Red Aduanera (LRA). La gestión manual de registros de entrada y salida de vehículos, conductores y visitantes genera cuellos de botella en las casetas de acceso, incrementando los tiempos de espera y la probabilidad de errores humanos.

Según datos del sector logístico, el tiempo promedio de registro manual de un tractocamión en una caseta de acceso oscila entre 3 y 5 minutos (Rodríguez, 2020). En instalaciones con alto tráfico vehicular, esto representa pérdidas significativas en productividad y satisfacción del cliente. Adicionalmente, la ausencia de registros digitalizados dificulta la trazabilidad y auditing de movimientos vehiculares.

El presente proyecto surge de la necesidad de automatizar y digitalizar el proceso de control de accesos vehiculares en LRA, implementando un sistema de checklist vehicular que permita:

- **Reducir tiempos de registro**: De 3-5 minutos a menos de 1 minuto por vehículo
- **Eliminar errores de captura manual**: Digitalización completa del proceso
- **Mejorar trazabilidad**: Registros digitales con evidencia fotográfica
- **Centralizar información**: Base de datos unificada accesible desde cualquier dispositivo
- **Reforzar seguridad**: Autenticación de dos factores y cumplimiento OWASP

### Problemática Detectada

| Problema | Impacto | Solución Propuesta |
|----------|---------|-------------------|
| Registro manual lento | 3-5 min por vehículo | App móvil con acceso rápido |
| Errores en plaques | Datos inconsistentes | Validación digital |
| Sin evidencia fotográfica | Sin trazabilidad | Captura de fotos automático |
| Turnos no controlados | Huecos en atención | Sistema de turnos integrado |
| Reportes manuales | Información tardía | Dashboard en tiempo real |

### Beneficios Esperados

| Beneficio | Cuantificación |
|-----------|---------------|
| Reducción de tiempo de registro | 70% menos tiempo |
| Eliminación de errores de captura | 100% digital |
| Trazabilidad completa | 100% de movimientos registrados |
| Reportes automáticos | Generación en tiempo real |
| Mejora en seguridad | 2FA implementado |

**Aplicación en el proyecto**: El sistema desarrollado permite a los guardias de seguridad registrar entradas y salidas de vehículos mediante una aplicación móvil intuitiva, capturando evidencia fotográfica y ejecutando checklists de inspección en menos de 60 segundos por vehículo.

---

## 1.2 Objetivos

### 1.2.1 Objetivo General

Desarrollar e implementar un sistema de checklist vehicular para la gestión de accesos de tractocamiones, conductores, empleados y visitantes en las instalaciones de Logística Red Aduanera, optimizando los tiempos de registro, mejorando la trazabilidad y fortaleciendo la seguridad mediante autenticación de dos factores.

### 1.2.2 Objetivos Específicos

| # | Objetivo Específico | Descripción |
|---|---------------------|-------------|
| OE-01 | Registro digital de accesos | Implementar módulo de registro de entrada/salida para tractocamiones, conductores, empleados y visitantes mediante app móvil |
| OE-02 | Checklist vehicular | Desarrollar formulario de inspección vehicular con captura de evidencia fotográfica y almacenamiento en JSON |
| OE-03 | Gestión de turnos | Implementar sistema de apertura y cierre de turnos para guardias de seguridad |
| OE-04 | Consulta de estado | Crear módulo de consulta de vehículos dentro de la instalación y pendientes de salida |
| OE-05 | Reportes automatizados | Implementar generación de reportes en PDF con datos de bitácora y estadísticas |
| OE-06 | Autenticación segura | Implementar JWT con 2FA (TOTP) para acceso seguro al sistema |
| OE-07 | API REST | Desarrollar backend con Django REST Framework para comunicación entre app móvil y base de datos |
| OE-08 | Compilación móvil | Generar APK instalable en dispositivos Android mediante Capacitor |

---

## 1.3 Alcances y Limitaciones

### 1.3.1 Alcances

- Sistema de registro de accesos vehiculares para 5 tipos de entidad: tractocamión, conductor, empleado, visitante y empleado propio
- Aplicación móvil Ionic/Angular para dispositivos Android
- Backend Django REST API con PostgreSQL
- Autenticación JWT con 2FA (TOTP)
- Dashboard web con React para consulta de estadísticas
- Generación de reportes en PDF
- Gestión de turnos de guardias de seguridad

### 1.3.2 Limitaciones

- No incluye gestión de inventario o carga de mercancía
- No se implementa geolocalización GPS en tiempo real
- No se incluye módulo de facturación o cobranza
- La app móvil solo funciona en Android (no iOS)
- No se implementa notificaciones push

---

## 1.4 Estructura del Documento

El presente informe técnico está estructurado de la siguiente manera:

- **Capítulo I**: Introducción - Justificación, objetivos, alcances y limitaciones
- **Capítulo II**: Marco Teórico - Descripción de herramientas y tecnologías utilizadas
- **Capítulo III**: Análisis y Diseño - Requerimientos, diagramas y diseño de la solución
- **Capítulo IV**: Implementación - Detalle técnico de la arquitectura y código fuente
- **Capítulo V**: Pruebas y Resultados - Validación del sistema y métricas de desempeño
- **Capítulo VI**: Conclusiones y Recomendaciones - Valoración final y работы futuras

---

*Nota: El organigrama de Logística Red Aduanera se incluirá en la versión final del documento.*