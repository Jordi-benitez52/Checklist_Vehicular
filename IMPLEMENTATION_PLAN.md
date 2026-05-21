# Plan de Implementación - Checklist Vehicular

## Resumen del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CHECKLIST VEHICULAR                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────────────────────────┐ │
│  │   FRONTEND    │    │         BACKEND (Django)          │ │
│  │   (React)     │────│  Railway: PostgreSQL + Gunicorn   │ │
│  │   Vercel      │    │  URL: checklistvehicular.up.railway│ │
│  └──────────────┘    └──────────────────────────────────┘ │
│          │                       │                         │
│          │                       │                         │
│          ▼                       ▼                         │
│  ┌──────────────┐    ┌──────────────────────────────────┐ │
│  │    MOBILE    │    │      POSTGRESQL (Railway)         │ │
│  │   (Ionic)    │    │   Puerto: 5432                    │ │
│  │ capacitor    │    │   Base: railway (vacía)           │ │
│  └──────────────┘    └──────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Arquitectura de Red

| Servicio | URL | Puerto | Estado |
|----------|-----|--------|--------|
| Backend Django | https://checklistvehicular-production.up.railway.app | 8000 | ✅ Deploying |
| Admin Django | https://checklistvehicular-production.up.railway.app/admin/ | 8000 | ⚠️ No data |
| Health Check | https://checklistvehicular-production.up.railway.app/api/platform/health/ | 8000 | ⚠️ No data |
| PostgreSQL | postgres.railway.internal | 5432 | ✅ Created |

## Pasos de Implementación Completos

### PASO 1: Instalar PostgreSQL CLI en Windows

1. Descargar PostgreSQL 18 de: https://www.postgresql.org/download/windows/
2. Ejecutar el installer
3. **Importante:** En el instalador, marcar "Command Line Tools" ✓
4. Agregar al PATH: `C:\Program Files\PostgreSQL\18\bin`
5. Verificar instalación:
   ```powershell
   psql --version
   ```

### PASO 2: Restaurar Base de Datos

```powershell
# Configurar contraseña para conexión a Railway
$env:PGPASSWORD = "tPqPjLNyuyQOgfqgcQRbSIxdbNXOKfjq"

# Conectar a Railway PostgreSQL y restaurar backup
psql -h postgres.railway.internal -U postgres -d railway -f backend/backup_checklist.sql

# Verificar que se restauraron datos
psql -h postgres.railway.internal -U postgres -d railway -c "SELECT COUNT(*) FROM auth_user;"
```

### PASO 3: Actualizar Frontend para Railway

En `frontend/src/services/api.js`, la URL ya está configurada para detectar Railway.

Para desplegar en Vercel:
1. Ir a vercel.com
2. Importar repositorio
3. Root directory: `frontend`
4. Environment variable: `VITE_API_URL=https://checklistvehicular-production.up.railway.app`
5. Deploy

### PASO 4: Actualizar Mobile

En `Mobile/src/environments/environment.ts` y `environment.prod.ts`:
```typescript
apiUrl: 'https://checklistvehicular-production.up.railway.app/api/platform'
```

Para rebuild:
```bash
cd Mobile
npm run build
npx cap sync android
npx cap open android
```

## Comandos Útiles

### Verificar conexión a Railway PostgreSQL
```powershell
$env:PGPASSWORD = "tPqPjLNyuyQOgfqgcQRbSIxdbNXOKfjq"
psql -h postgres.railway.internal -U postgres -d railway -c "SELECT 1;"
```

### Ver logs del backend en Railway
```bash
railway logs -n 100
```

### Reiniciar servicio en Railway
```bash
railway up
```

## Estado de Implementación

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend Django | ✅ | Desplegado en Railway |
| PostgreSQL | ✅ | Creado, necesita datos |
| whitenoise | ✅ | Instalado |
| Frontend | ❌ | No desplegado |
| Mobile | ❌ | URL pendiente |
| Migración DB | ❌ | Pendiente |

## URLs del Proyecto

- **Backend:** https://checklistvehicular-production.up.railway.app
- **Admin:** https://checklistvehicular-production.up.railway.app/admin/
- **Health:** https://checklistvehicular-production.up.railway.app/api/platform/health/
- **GitHub Repo:** https://github.com/Jordi-benitez52/Checklist_Vehicular