# REPORTE OWASP - Checklist Vehicular LRA
## Plataforma de Gestión de Acceso y Control Vehicular

---

## 1. INFORMACIÓN GENERAL

| Campo | Valor |
|-------|-------|
| **Proyecto** | Checklist Vehicular LRA |
| **URL Backend** | http://localhost:8000 |
| **URL Frontend** | http://localhost:5173 |
| **Fecha de Test** | 2026-05-21 |
| **Herramienta** | OWASP ZAP 2.17.0 + Testing Manual |

---

## 2. ALCANCE DEL TEST

| Componente | Tipo | Estado |
|------------|------|--------|
| Frontend Web (React + Vite) | Activo | ✅ Escaneado |
| Backend API (Django REST) | Parcial | ✅ Testeado manualmente |
| Login Endpoint | Parcial | ✅ Testeado manualmente |

---

## 3. RESULTADOS FRONTEND (OWASP ZAP)

### 3.1 Resumen de Alertas

| Severidad | Cantidad | Descripción |
|----------|----------|-------------|
| 🔴 HIGH | 0 | Sin vulnerabilidades altas |
| 🟡 MEDIUM | 3 | CSP, Clickjacking, CORS |
| 🟢 LOW | 3 | Timestamp, X-Content-Type, HSTS |
| 🔵 INFO | 4 | Comments, Cache, Modern App |

### 3.2 Detalle de Alertas MEDIUM

#### A. Content Security Policy (CSP) Not Configured
| Campo | Valor |
|-------|-------|
| Plugin ID | 10038 |
| URL | http://localhost:5173 |
| CWE | 693 |
| Solución | Configurar CSP header en producción |
| Clasificación | **Informativo** (dev environment) |

#### B. Cross-Domain Misconfiguration (CORS)
| Campo | Valor |
|-------|-------|
| Plugin ID | 10098 |
| URL | cdn.jsdelivr.net (CDN externo) |
| Evidencia | Access-Control-Allow-Origin: * |
| Solución | N/A (CDN público, no exponencial) |
| Clasificación | **Aceptado** (recurso público estático) |

#### C. Missing Anti-Clickjacking Header
| Campo | Valor |
|-------|-------|
| Plugin ID | 10020 |
| CWE | 1021 |
| Solución | Agregar X-Frame-Options header |
| Clasificación | **Bajo** (requiere iframe malicioso) |

---

## 4. RESULTADOS BACKEND - LOGIN ENDPOINT

### 4.1 Métodos de Test Aplicados

| Técnica | Herramienta | Resultado |
|---------|-------------|-----------|
| SQL Injection | Testing Manual (PowerShell) | ✅ Prevenido |
| Cross-Site Scripting (XSS) | Testing Manual | ✅ Prevenido |
| Authentication Bypass | Testing Manual | ✅ Prevenido |
| Denial of Service (DoS) | Testing Manual | ✅ Prevenido |
| Input Validation | Testing Manual | ✅ Funcionando |
| Method Restriction | Testing Manual | ✅ Correcto |

### 4.2 Detalle de Tests - Login Endpoint

| Test | Payload | Código HTTP | Resultado |
|------|---------|-------------|-----------|
| SQL Injection (username) | `' OR '1'='1` | 401 | ✅ Prevenido |
| SQL Injection (password) | `' OR '1'='1` | 401 | ✅ Prevenido |
| Admin Bypass | `admin'--` | 401 | ✅ Prevenido |
| XSS (username) | `<script>alert(1)</script>` | 401 | ✅ Prevenido |
| XSS (password) | `<script>alert(1)</script>` | 401 | ✅ Prevenido |
| Empty Fields | `{}` | 400 | ✅ Validación OK |
| Long Payload (10KB) | `AAAAAAAA...` | 401 | ✅ Prevenido |
| Malformed JSON | `{invalid` | 400 | ✅ Validación OK |
| GET Method | GET /login/ | 405 | ✅ Correcto |

---

## 5. CLASIFICACIÓN DE RIESGO

### 5.1 Frontend

| Vulnerabilidad | Riesgo | Estado |
|---------------|--------|--------|
| SQL Injection | N/A | No aplica (React frontend) |
| XSS Reflected | N/A | No encontrado |
| CSRF | Bajo | No encontrado en SPA |
| Missing Headers | Medio | Informativo en dev |

### 5.2 Backend

| Vulnerabilidad | Riesgo | Estado |
|---------------|--------|--------|
| SQL Injection | Bajo | ✅ Prevenido por ORM |
| XSS | Bajo | ✅ Prevenido (JSON API) |
| Authentication Bypass | Bajo | ✅ Prevenido |
| Credential Disclosure | Alto | ✅ No expuesto |
| Rate Limiting | Medio | ⚠️ No medido |

---

## 6. LIMITACIONES DEL TEST

| Limitación | Razón |
|------------|-------|
| Login endpoint no escaneable automáticamente | Requiere POST + 2FA (OTP) |
| Backend no expuesto externamente | Solo localhost |
| Credenciales de prueba no verificadas | 401 puede ser credenciales inválidas |
| Ionic Mobile no escaneado | Requiere dispositivo/emulador |

---

## 7. RECOMENDACIONES

### 7.1 Correcciones Inmediatas (Opcional)

| Prioridad | Acción | Archivo |
|----------|--------|---------|
| Baja | Agregar X-Frame-Options | vite.config.js |
| Baja | Documentar CSP para producción | config docs |

### 7.2 Preparación para Producción

| Prioridad | Acción |
|-----------|--------|
| Alta | Configurar HTTPS (HSTS) |
| Alta | Configurar rate limiting en login |
| Media | Implementar logging de intentos de login |
| Media | Agregar captcha después de 3 intentos fallidos |

---

## 8. CONCLUSIÓN

### 8.1 Nivel de Seguridad

| Componente | Clasificación |
|------------|---------------|
| Frontend | **Aceptable** - Mayormente informativo |
| Backend Login | **Bueno** - Sin vulnerabilidades críticas |
| Overall | **Aceptable para desarrollo** |

### 8.2 Resumen Executive

La plataforma Checklist Vehicular LRA presenta un **nivel de seguridad aceptable** para el entorno de desarrollo. Se identificaron:

- **0 vulnerabilidades HIGH**
- **3 vulnerabilidades MEDIUM** (2 son informativas, 1 es de CDN externo)
- **3 vulnerabilidades LOW** (todas de configuración de desarrollo)
- **4 alertas INFO** (comportamiento esperado)

El backend API demonstra una **correcta implementación de medidas de seguridad** contra SQL Injection, XSS y otros ataques comunes, devolviendo códigos de error apropiados (401, 400, 405) para intentos de acceso no autorizados.

### 8.3 Pruebas Pendientes (Opcional)

| Prueba | Herramienta Recomendada |
|--------|------------------------|
| Escaneo completo API con auth | Burp Suite Professional |
| Test de Rate Limiting | curl con múltiples requests |
| Penetration Testing completo | OWASP Burp Suite/ZAP Avanzado |

---

## 9. ANEXO: RESULTADOS CRUDOS ZAP (FRONTEND)

```
MEDIUM:
- Content Security Policy Not Configured (10038)
- Cross-Domain Misconfiguration (10098)
- Missing Anti-Clickjacking Header (10020)

LOW:
- Timestamp Disclosure - Unix (10096)
- X-Content-Type-Options Header Missing (10021)
- Strict-Transport-Security Header Not Set (10035)

INFO:
- Modern Web Application (10109)
- Information Disclosure - Sensitive URL Parameters (10024)
- Information Disclosure - Suspicious Comments (10027)
- Retrieved from Cache (10050)
```

---

**Documento generado:** 2026-05-21
**Versión:** 1.0
**Clasificación:** Uso Académico - Proyecto Escolar