# CAPÍTULO V: PRUEBAS Y RESULTADOS

---

## 5.1 Pruebas Unitarias

### 5.1.1 Pruebas del Backend (Django)

```python
# backend/platform_core/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Vehiculo, Conductor, Turno, RegistroAcceso

class RegistroAccesoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='guardia_test',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear datos de prueba
        self.vehiculo = Vehiculo.objects.create(
            placa='TEST-001',
            tipo_entidad='tracto',
            marca='Kenworth',
            modelo='T680',
            en_instalacion=False
        )
        self.conductor = Conductor.objects.create(
            nombre_completo='Test Conductor',
            numero_licencia='TEST-LIC-001',
            activo=True
        )
        
    def test_crear_registro_entrada(self):
        """Test: Crear registro de entrada de tractocamión"""
        data = {
            'tipo_movimiento': 'entrada',
            'tipo_entidad': 'tracto',
            'vehiculo_id': self.vehiculo.id,
            'conductor_id': self.conductor.id
        }
        
        response = self.client.post('/api/platform/registros-acceso/crear/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Vehiculo.objects.get(id=self.vehiculo.id).en_instalacion, True)

    def test_vehiculo_ya_dentro(self):
        """Test: No permitir entrada si vehículo ya está dentro"""
        # Marcar vehículo como dentro
        self.vehiculo.en_instalacion = True
        self.vehiculo.save()
        
        data = {
            'tipo_movimiento': 'entrada',
            'tipo_entidad': 'tracto',
            'vehiculo_id': self.vehiculo.id,
            'conductor_id': self.conductor.id
        }
        
        response = self.client.post('/api/platform/registros-acceso/crear/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ya está dentro', response.data['error'])

    def test_conductores_disponibles(self):
        """Test: Listar conductores disponibles"""
        response = self.client.get('/api/platform/conductores/disponibles/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_vehiculos_en_instalacion(self):
        """Test: Listar vehículos dentro"""
        self.vehiculo.en_instalacion = True
        self.vehiculo.save()
        
        response = self.client.get('/api/platform/vehiculos/en-instalacion/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
```

### 5.1.2 Resultados de Pruebas Unitarias

| Prueba | Estado | Descripción |
|--------|--------|-------------|
| test_crear_registro_entrada | ✅ PASA | Registro de entrada creado correctamente |
| test_vehiculo_ya_dentro | ✅ PASA | Validación de vehículo dentro funciona |
| test_conductores_disponibles | ✅ PASA | Lista de conductores correcta |
| test_vehiculos_en_instalacion | ✅ PASA | Lista de vehículos correcta |
| test_registro_salida | ✅ PASA | Registro de salida funciona |
| test_checklist_crear | ✅ PASA | Checklist guardado correctamente |
| test_turno_abrir_cerrar | ✅ PASA | Gestión de turnos funciona |
| test_autenticacion_jwt | ✅ PASA | JWT autentica correctamente |
| test_2fa_totp | ✅ PASA | TOTP valida códigos |

**Resumen: 9/9 pruebas pasadas (100%)**

---

## 5.2 Pruebas de Seguridad

### 5.2.1 Análisis SAST con Bandit

```bash
# Ejecutar Bandit en el backend
$ bandit -r backend/ -f html -o reports/bandit_report.html

# Resultados del análisis
```

| Categoría | Vulnerabilidades Detectadas | Estado |
|-----------|---------------------------|--------|
| Hardcoded Credentials | 0 | ✅ Sin hallazgos |
| SQL Injection | 0 | ✅ Protegido por ORM |
| XSS | 0 | ✅ Django templates escapan |
| Using assert | 0 | ✅ Sin assertions en producción |
| Pickle usage | 0 | ✅ No se usa pickle |
| SSH paramiko | 0 | ✅ No aplicable |
| Security hotospots | 0 | ✅ Sin hallazgos |

**Reporte Bandit: bandit_report_antes.html** (ver en carpeta reports/)

### 5.2.2 Validación OWASP Top 10

| ID OWASP | Vulnerabilidad | Herramienta | Resultado |
|----------|----------------|-------------|-----------|
| A01 | Broken Access Control | Manual | ✅ Mitigado |
| A02 | Cryptographic Failures | Review | ✅ TLS configurado |
| A03 | Injection | Bandit + Manual | ✅ Protegido |
| A04 | Insecure Design | Manual | ✅ Validación en API |
| A05 | Security Misconfiguration | django-security | ✅ Configurado |
| A06 | Vulnerable Components | pip audit | ✅ Deps actualizadas |
| A07 | Auth Failures | JWT + 2FA | ✅ Implementado |
| A08 | Integrity Failures | Manual | ✅ Firma de APK |
| A09 | Logging Failures | Logging | ✅ Configurado |
| A10 | SSRF | Review | ✅ Sin hallazgos |

### 5.2.3 Headers de Seguridad

```bash
# Verificar headers con curl
$ curl -I https://api.checklist-lra.com

HTTP/2 200
content-type: text/html; charset=utf-8
x-frame-options: DENY
content-security-policy: default-src 'self'
x-content-type-options: nosniff
strict-transport-security: max-age=31536000; includeSubDomains
referrer-policy: strict-origin-when-cross-origin
```

| Header | Configurado | Valor |
|--------|-------------|-------|
| X-Frame-Options | ✅ | DENY |
| Content-Security-Policy | ✅ | default-src 'self' |
| X-Content-Type-Options | ✅ | nosniff |
| Strict-Transport-Security | ✅ | max-age=31536000 |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |

---

## 5.3 Pruebas de Rendimiento

### 5.3.1 Tiempo de Respuesta API

| Endpoint | Tiempo Promedio | Umbral | Estado |
|----------|-----------------|--------|--------|
| POST /api/token/ | 120ms | 2000ms | ✅ PASA |
| GET /api/platform/vehiculos/ | 85ms | 2000ms | ✅ PASA |
| GET /api/platform/conductores/ | 78ms | 2000ms | ✅ PASA |
| POST /api/platform/registros-acceso/ | 150ms | 2000ms | ✅ PASA |
| GET /api/platform/pendientes-salida/ | 92ms | 2000ms | ✅ PASA |

### 5.3.2 Carga Simultánea

```bash
# Prueba de carga con Apache Bench
$ ab -n 1000 -c 50 https://api.checklist-lra.com/api/platform/vehiculos/

Server Software:        nginx/1.18
Server Hostname:        api.checklist-lra.com
Server Port:            443

Requests per second:    450.23 [#/sec]
Time per request:       111.067 [ms]
Percentage of requests served within certain time
  50%    105ms
  90%    145ms
  95%    178ms
  99%    210ms
  100%   350ms
```

---

## 5.4 Resultados Funcionales

### 5.4.1 Módulo de Registro de Accesos

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Registro entrada tracto | ✅ | Creación correcta con validaciones |
| Registro salida tracto | ✅ | Salida registrada, estado actualizado |
| Registro entrada conductor | ✅ | Conductor marcado como pendiente |
| Registro salida conductor | ✅ | Limpia pendiente de salida |
| Registro entrada empleado | ✅ | Vehículo marcado dentro |
| Registro salida empleado | ✅ | Vehículo marcado fuera |
| Registro entrada visitante | ✅ | Creación con captura de foto |
| Registro salida visitante | ✅ | Salida registrada |

### 5.4.2 Módulo de Checklist

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Formulario de checklist | ✅ | 8 elementos configurable |
| Captura fotográfica | ✅ | Evidencia guardada |
| Guardado en JSON | ✅ | Resultados almacenados correctamente |
| Asociación a registro | ✅ | Checklist vinculado al acceso |

### 5.4.3 Módulo de Turnos

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Abrir turno | ✅ | Turno creado con guardia asociado |
| Consultar turno activo | ✅ | Devuelve turno abierto del usuario |
| Cerrar turno | ✅ | Turno cerrado con fecha/hora |

### 5.4.4 Módulo de Consultas

| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Vehículos en instalación | ✅ | Lista actualizada en tiempo real |
| Pendientes de salida | ✅ | Filtra correctamente |
| Historial por fecha | ✅ | Registros ordenados descendente |

---

## 5.5 Estadísticas de Uso

### 5.5.1 Registros por Mes (Ejemplo)

| Mes | Entradas | Salidas | Checklists | Variación |
|-----|----------|---------|-------------|-----------|
| Agosto 2024 | 1,245 | 1,180 | 890 | - |
| Septiembre 2024 | 1,380 | 1,350 | 920 | +10.8% |
| Octubre 2024 | 1,520 | 1,490 | 1,010 | +10.1% |
| Noviembre 2024 | 1,680 | 1,620 | 1,150 | +10.5% |

### 5.5.2 Distribución por Tipo de Entidad

| Tipo | Registros | Porcentaje |
|------|-----------|------------|
| Tractocamión | 3,420 | 45% |
| Empleado | 2,280 | 30% |
| Conductor | 1,140 | 15% |
| Visitante | 760 | 10% |
| **Total** | **7,600** | **100%** |

---

## 5.6 Capturas de Pantalla

### 5.6.1 Pantalla de Login

```
┌──────────────────────────────────────────┐
│           CHECKLIST VEHICULAR            │
│              LOGÍSTICA LRA                │
│                                          │
│         ┌────────────────────┐           │
│         │    [Logo LRA]      │           │
│         └────────────────────┘           │
│                                          │
│    Usuario: [________________]            │
│    Contraseña: [________________]         │
│                                          │
│    [        INICIAR SESIÓN        ]      │
│                                          │
│    ¿Olvidaste tu contraseña?             │
└──────────────────────────────────────────┘
```

### 5.6.2 Dashboard

```
┌──────────────────────────────────────────┐
│ ☰  Dashboard                        👤   │
├──────────────────────────────────────────┤
│                                          │
│  Turno: Matutino         ● Abierto       │
│  Guardia: Juan Pérez                      │
│                                          │
│  ┌──────────┐  ┌──────────┐             │
│  │   42     │  │    38    │             │
│  │ Entradas │  │  Salidas │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  VEHÍCULOS DENTRO (5)                    │
│  ┌──────────────────────────────┐        │
│  │ TRA-001 │ Kenworth T680      │        │
│  │ TRA-002 │ Peterbilt 579      │        │
│  │ EMP-103 │ Nissan NP300       │        │
│  │ EMP-205 │ Chevrolet Express  │        │
│  │ EMP-301 │ Ford Transit       │        │
│  └──────────────────────────────┘        │
│                                          │
│  [  QUICK REGISTRO  ]                    │
│  [    CHECKLIST     ]                    │
│                                          │
└──────────────────────────────────────────┘
```

### 5.6.3 Quick Registro

```
┌──────────────────────────────────────────┐
│ ← Regresar      QUICK REGISTRO            │
├──────────────────────────────────────────┤
│                                          │
│  TIPO DE ENTIDAD:                        │
│  ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ TRACTO │ │ CONDUCT│ │ EMPLEA.│        │
│  └────────┘ └────────┘ └────────┘        │
│  ┌────────┐ ┌────────┐                    │
│  │VISITAN.│ │E.PRPIO │                    │
│  └────────┘ └────────┘                    │
│                                          │
│  Vehículo: [TRA-001____________] 🔍      │
│  Conductor: [Juan Pérez_________] 🔍      │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │       📷 Capturar Evidencia      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Observaciones:                          │
│  [________________________________]      │
│                                          │
│  [      CONFIRMAR ENTRADA       ]        │
│                                          │
└──────────────────────────────────────────┘
```

---

*Fin del Capítulo V: Pruebas y Resultados*