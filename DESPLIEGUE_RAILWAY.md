# Checklist Vehicular - Despliegue en Railway

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                       RAILWAY                            │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │ PostgreSQL  │◄───│  Django API   │    │  Vercel   │  │
│  │  Database   │    │   Backend     │    │ Frontend  │  │
│  └─────────────┘    └──────────────┘    └───────────┘  │
│                                              │          │
└──────────────────────────────────────────────┴──────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Ionic Mobile    │
                 └──────────────────┘
```

## Archivos Modificados para Railway

### Backend

| Archivo | Cambio |
|---------|--------|
| `backend/railway.json` | healthCheckPath: `/api/platform/health/` |
| `backend/Procfile` | Nuevo archivo para gunicorn |
| `backend/requirements.txt` | Agregado `gunicorn`, `dj-database-url` |
| `backend/config/settings.py` | ALLOWED_HOSTS, CORS, CSRF, DB config |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `frontend/src/services/api.js` | Agregado soporte Railway |

### Mobile

| Archivo | Cambio |
|---------|--------|
| `Mobile/src/environments/environment.ts` | URL placeholder |
| `Mobile/src/environments/environment.prod.ts` | URL placeholder |

---

## Pasos de Despliegue

### Fase 1: Base de Datos (Railway)

1. Ir a [railway.app](https://railway.app) e iniciar sesión
2. Click **New Project** → **Provision PostgreSQL**
3. Esperar a queProvision 완료
4. En **Variables** de la base de datos, copiar `DATABASE_URL`

### Fase 2: Backend (Railway)

1. En Railway, click **New Project** → **Deploy from GitHub**
2. Seleccionar el repositorio
3. En **Variables**, agregar:
   ```
   DATABASE_URL=<valor de Fase 1>
   DJANGO_SECRET_KEY=<generar nueva clave secreta>
   DEBUG=False
   ```
4. Railway detectará automáticamente Django (por railway.json)
5. Esperar a que termine el build
6. Obtener la URL del backend (ej: `checklist-api.up.railway.app`)

### Fase 3: Frontend (Vercel)

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión
2. Importar el repositorio (solo la carpeta `frontend`)
3. Framework: **Vite**
4. Root Directory: `frontend`
5. Environment Variable: `VITE_API_URL=https://<backend-url>`
6. Deploy

### Fase 4: Mobile (Ionic)

1. Actualizar `environment.prod.ts` con la URL de Railway:
   ```typescript
   apiUrl: 'https://<backend-url>/api/platform'
   ```
2. Compilar para producción:
   ```bash
   cd Mobile
   ionic build --prod
   ```
3. Usar Capacitor para generar APK/IPA

---

## Comandos Útiles

### Verificar que el backend funciona

```bash
curl https://<backend-url>/api/platform/health/
```

Respuesta esperada:
```json
{"status": "ok", "service": "checklist-vehicular-api"}
```

### Ver logs de Railway

```bash
railway logs -n 100
```

### Reiniciar el servicio

```bash
railway up
```

---

## Variables de Entorno en Railway

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string de PostgreSQL | `postgres://user:pass@host:5432/db` |
| `DJANGO_SECRET_KEY` | Clave secreta de Django | (generar con python -c "import secrets; print(secrets.token_hex(50))") |
| `DEBUG` | Modo debug | `False` |
| `ALLOWED_HOSTS` | Hosts permitidos | `.railway.app,.up.railway.app` |

---

## Solución de Problemas

### Error: "Module not found"

Verificar que `requirements.txt` incluya todas las dependencias y que `dj-database-url` esté incluido.

### Error: "Connection refused" a la base de datos

Verificar que `DATABASE_URL` esté correctamente configurado en Railway.

### Error: CORS

Verificar que el dominio de Vercel esté en `CORS_ALLOWED_ORIGINS` en `settings.py`.

### Error: 500 en el health check

Ejecutar migraciones manualmente:
```bash
railway run python manage.py migrate
```

---

## Notas Importantes

1. **La base de datos local NO se migra automáticamente** - Se necesita hacer dump/export de los datos locales e importarlos a Railway PostgreSQL.

2. **El secret key está hardcodeado en .env** - Para producción, usar variable de entorno.

3. **Static files** - Railway sirve static files con gunicorn. Verificar que `STATIC_ROOT` esté configurado.

---

## Costos

| Servicio | Plan | Costo |
|----------|------|-------|
| Railway (PostgreSQL + Django) | Starter | $0-5/mes |
| Vercel (Frontend) | Hobby | Gratis |
| **Total** | | **$0-5/mes** |