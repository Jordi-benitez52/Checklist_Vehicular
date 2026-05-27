# CAPÍTULO IV: IMPLEMENTACIÓN

---

## 4.1 Estructura del Proyecto

El proyecto se estructura en tres componentes principales: Backend (Django), Frontend (React/Vite) y Mobile (Ionic/Angular).

```
checklist_vehicular/
├── backend/                  # Django REST API
│   ├── accounts/            # Gestión de usuarios
│   ├── core/                # Modelos principales (Turno, RegistroAcceso)
│   ├── platform_core/       # Modelos de negocio
│   │   ├── models.py        # Vehiculo, Conductor, Empleado, Visitante
│   │   ├── serializers.py   # Serializers DRF
│   │   └── views.py         # API Views
│   ├── sql/                 # Scripts SQL
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                # React Web
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas (Dashboard, Login, etc.)
│   │   ├── services/        # api.js con Axios
│   │   ├── context/         # AuthContext, WebSocketContext
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Mobile/                  # Ionic App
│   ├── src/
│   │   ├── app/            # Módulos Angular
│   │   ├── pages/          # Páginas Ionic
│   │   ├── services/        # API services
│   │   └── theme/          # Estilos
│   ├── capacitor.config.ts
│   └── package.json
│
├── reports/                 # Reportes de seguridad
│   └── bandit_report_*.html
│
└── documentation/          # Documentación
    ├── DIAGRAMA_UML.md
    ├── DIAGRAMA_CASOS_USO.md
    └── PLAN_INFORME_TECNICO.md
```

---

## 4.2 Backend - Django REST API

### 4.2.1 Configuración Principal

```python
# backend/checklist/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Local apps
    'accounts',
    'core',
    'platform_core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '5/minute',
        'user': '100/minute'
    }
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8100',
    'http://localhost:5173',
]
```

### 4.2.2 Modelos (platform_core/models.py)

```python
from django.db import models
from django.contrib.auth.models import User

class Empresa(models.Model):
    nombre = models.CharField(max_length=255)
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'empresa'

    def __str__(self):
        return self.nombre

class Vehiculo(models.Model):
    placa = models.CharField(max_length=20, unique=True)
    clave_interna = models.CharField(max_length=50, blank=True, null=True)
    tipo_entidad = models.CharField(max_length=30)  # 'tracto', 'automovil'
    marca = models.CharField(max_length=100, blank=True, null=True)
    modelo = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    en_instalacion = models.BooleanField(default=False)
    conductor_actual = models.ForeignKey(
        'Conductor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vehiculo_conductor'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vehiculo'

    def __str__(self):
        return f"{self.placa} - {self.marca} {self.modelo}"

class Conductor(models.Model):
    nombre_completo = models.CharField(max_length=255)
    numero_licencia = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)
    vehiculo = models.OneToOneField(
        Vehiculo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conductor_vehiculo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conductor'

    def __str__(self):
        return self.nombre_completo

class Empleado(models.Model):
    nombre_completo = models.CharField(max_length=255)
    numero_empleado = models.CharField(max_length=50)
    activo = models.BooleanField(default=True)
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='empleados'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'empleado'

    def __str__(self):
        return f"{self.nombre_completo} - {self.empresa.nombre}"

class Visitante(models.Model):
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    motivo_visita = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'visitante'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Turno(models.Model):
    TIPO_TURNO_CHOICES = [
        ('matutino', 'Matutino'),
        ('vespertino', 'Vespertino'),
        ('nocturno', 'Nocturno'),
    ]
    
    guardia = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    tipo_turno = models.CharField(max_length=20, choices=TIPO_TURNO_CHOICES)
    abierto = models.BooleanField(default=True)

    class Meta:
        db_table = 'turno'

    def __str__(self):
        return f"{self.guardia.username} - {self.tipo_turno} - {'Abierto' if self.abierto else 'Cerrado'}"

class RegistroAcceso(models.Model):
    TIPO_MOVIMIENTO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]
    TIPO_ENTIDAD_CHOICES = [
        ('tracto', 'Tractocamión'),
        ('conductor', 'Conductor'),
        ('empleado', 'Empleado'),
        ('visitante', 'Visitante'),
        ('empleado_propio', 'Empleado Propio'),
    ]

    turno = models.ForeignKey(Turno, on_delete=models.CASCADE, related_name='registros')
    tipo_movimiento = models.CharField(max_length=20, choices=TIPO_MOVIMIENTO_CHOICES)
    tipo_entidad = models.CharField(max_length=30, choices=TIPO_ENTIDAD_CHOICES)
    vehiculo = models.ForeignKey(Vehiculo, on_delete=models.SET_NULL, null=True, blank=True)
    conductor = models.ForeignKey(Conductor, on_delete=models.SET_NULL, null=True, blank=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.SET_NULL, null=True, blank=True)
    visitante = models.ForeignKey(Visitante, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    conductor_pendiente_salida = models.BooleanField(default=False)
    observaciones = models.TextField(blank=True, null=True)
    tiene_evidencia = models.BooleanField(default=False)
    evidencia_fotografica = models.ImageField(upload_to='evidencias/%Y/%m/%d/', null=True, blank=True)

    class Meta:
        db_table = 'registro_acceso'
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.tipo_entidad} - {self.tipo_movimiento} - {self.fecha_hora}"

class Checklist(models.Model):
    registro_acceso = models.ForeignKey(RegistroAcceso, on_delete=models.CASCADE, related_name='checklists')
    resultados = models.JSONField()
    observaciones = models.TextField(blank=True, null=True)
    evidencia_fotografica = models.ImageField(upload_to='checklists/%Y/%m/%d/', null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    evaluador = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'checklist'

    def __str__(self):
        return f"Checklist {self.id} - {self.registro_acceso}"
```

### 4.2.3 Serializers (platform_core/serializers.py)

```python
from rest_framework import serializers
from .models import (
    Empresa, Vehiculo, Conductor, Empleado,
    Visitante, Turno, RegistroAcceso, Checklist
)

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nombre', 'activa']

class VehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehiculo
        fields = [
            'id', 'placa', 'clave_interna', 'tipo_entidad',
            'marca', 'modelo', 'color', 'en_instalacion',
            'conductor_actual'
        ]

class ConductorSerializer(serializers.ModelSerializer):
    vehiculo = VehiculoSerializer(read_only=True)
    vehiculo_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehiculo.objects.all(),
        source='vehiculo',
        write_only=True,
        required=False
    )

    class Meta:
        model = Conductor
        fields = [
            'id', 'nombre_completo', 'numero_licencia',
            'activo', 'vehiculo', 'vehiculo_id'
        ]

class EmpleadoSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)
    empresa_id = serializers.PrimaryKeyRelatedField(
        queryset=Empresa.objects.all(),
        source='empresa',
        write_only=True
    )

    class Meta:
        model = Empleado
        fields = ['id', 'nombre_completo', 'numero_empleado', 'activo', 'empresa', 'empresa_id']

class VisitanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitante
        fields = ['id', 'nombre', 'apellido', 'telefono', 'motivo_visita']

class TurnoSerializer(serializers.ModelSerializer):
    guardia_username = serializers.CharField(source='guardia.username', read_only=True)

    class Meta:
        model = Turno
        fields = [
            'id', 'guardia', 'guardia_username', 'fecha_apertura',
            'fecha_cierre', 'tipo_turno', 'abierto'
        ]

class RegistroAccesoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroAcceso
        fields = [
            'id', 'turno', 'tipo_movimiento', 'tipo_entidad',
            'vehiculo', 'conductor', 'empleado', 'visitante',
            'fecha_hora', 'conductor_pendiente_salida', 'observaciones',
            'tiene_evidencia', 'evidencia_fotografica'
        ]

class ChecklistSerializer(serializers.ModelSerializer):
    evaluador_username = serializers.CharField(source='evaluador.username', read_only=True)

    class Meta:
        model = Checklist
        fields = [
            'id', 'registro_acceso', 'resultados', 'observaciones',
            'evidencia_fotografica', 'fecha_creacion', 'evaluador',
            'evaluador_username'
        ]
```

### 4.2.4 Views (platform_core/views.py)

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import (
    Vehiculo, Conductor, Empleado, Visitante,
    Turno, RegistroAcceso, Checklist
)
from .serializers import (
    VehiculoSerializer, ConductorSerializer, EmpleadoSerializer,
    TurnoSerializer, RegistroAccesoSerializer, ChecklistSerializer
)

class RegistroAccesoCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        turno_id = data.get('turno_id')
        
        # Obtener turno activo
        try:
            turno = Turno.objects.get(id=turno_id, abierto=True)
        except Turno.DoesNotExist:
            return Response(
                {'error': 'No existe un turno abierto'},
                status=status.HTTP_400_BAD_REQUEST
            )

        tipo_entidad = data.get('tipo_entidad')
        tipo_movimiento = data.get('tipo_movimiento')

        # Validaciones según tipo de entidad
        vehiculo = None
        conductor = None
        empleado = None
        visitante = None

        if tipo_entidad == 'tracto':
            vehiculo_id = data.get('vehiculo_id')
            conductor_id = data.get('conductor_id')
            
            try:
                vehiculo = Vehiculo.objects.get(id=vehiculo_id)
                if tipo_movimiento == 'entrada':
                    if vehiculo.en_instalacion:
                        return Response(
                            {'error': 'El vehículo ya está dentro'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    vehiculo.en_instalacion = True
                    vehiculo.conductor_actual_id = conductor_id
                    vehiculo.save()
                else:  # salida
                    if not vehiculo.en_instalacion:
                        return Response(
                            {'error': 'El vehículo no está dentro'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    vehiculo.en_instalacion = False
                    vehiculo.conductor_actual = None
                    vehiculo.save()
            except Vehiculo.DoesNotExist:
                return Response({'error': 'Vehículo no encontrado'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear registro
        registro = RegistroAcceso.objects.create(
            turno=turno,
            tipo_movimiento=tipo_movimiento,
            tipo_entidad=tipo_entidad,
            vehiculo=vehiculo,
            conductor=conductor,
            empleado=empleado,
            visitante=visitante,
            conductor_pendiente_salida=(tipo_entidad in ['tracto', 'conductor']),
            observaciones=data.get('observaciones', ''),
            tiene_evidencia=data.get('tiene_evidencia', False)
        )

        serializer = RegistroAccesoSerializer(registro)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ConductoresDisponiblesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Conductor sin entrada pendiente
        conductores_con_entrada = RegistroAcceso.objects.filter(
            conductor_pendiente_salida=True
        ).values_list('conductor_id', flat=True)

        conductores = Conductor.objects.filter(
            activo=True
        ).exclude(id__in=conductores_con_entrada)

        serializer = ConductorSerializer(conductores, many=True)
        return Response(serializer.data)

class VehiculosEnInstalacionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vehiculos = Vehiculo.objects.filter(en_instalacion=True)
        serializer = VehiculoSerializer(vehiculos, many=True)
        return Response(serializer.data)

class PendientesSalidaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Tractos y conductores pendientes de salida
        pendientes = RegistroAcceso.objects.filter(
            conductor_pendiente_salida=True
        ).select_related('vehiculo', 'conductor', 'turno')

        data = []
        for p in pendientes:
            data.append({
                'id': p.id,
                'tipo_entidad': p.tipo_entidad,
                'vehiculo': VehiculoSerializer(p.vehiculo).data if p.vehiculo else None,
                'conductor': ConductorSerializer(p.conductor).data if p.conductor else None,
                'fecha_entrada': p.fecha_hora
            })

        return Response(data)

class TurnoManageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        user = request.user

        if action == 'abrir':
            # Verificar si ya tiene turno abierto
            turno_existente = Turno.objects.filter(
                guardia=user,
                abierto=True
            ).exists()
            
            if turno_existente:
                return Response(
                    {'error': 'Ya tienes un turno abierto'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            turno = Turno.objects.create(
                guardia=user,
                tipo_turno=request.data.get('tipo_turno', 'matutino'),
                abierto=True
            )
            return Response(TurnoSerializer(turno).data, status=status.HTTP_201_CREATED)

        elif action == 'cerrar':
            try:
                turno = Turno.objects.get(guardia=user, abierto=True)
                turno.abierto = False
                turno.fecha_cierre = timezone.now()
                turno.save()
                return Response(TurnoSerializer(turno).data)
            except Turno.DoesNotExist:
                return Response(
                    {'error': 'No tienes un turno abierto'},
                    status=status.HTTP_400_BAD_REQUEST
                )

class ChecklistCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        registro_acceso_id = data.get('registro_acceso_id')

        try:
            registro = RegistroAcceso.objects.get(id=registro_acceso_id)
        except RegistroAcceso.DoesNotExist:
            return Response(
                {'error': 'Registro de acceso no encontrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        checklist = Checklist.objects.create(
            registro_acceso=registro,
            resultados=data.get('resultados'),
            observaciones=data.get('observaciones', ''),
            evaluador=request.user
        )

        serializer = ChecklistSerializer(checklist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### 4.2.5 URLs (platform_core/urls.py)

```python
from django.urls import path
from .views import (
    RegistroAccesoCreateAPIView,
    ConductoresDisponiblesAPIView,
    VehiculosEnInstalacionAPIView,
    PendientesSalidaAPIView,
    TurnoManageAPIView,
    ChecklistCreateAPIView,
)

urlpatterns = [
    path('registros-acceso/crear/', RegistroAccesoCreateAPIView.as_view(), name='registro-acceso-crear'),
    path('registros-acceso/', RegistroAccesoCreateAPIView.as_view(), name='registro-acceso-list'),
    path('conductores/disponibles/', ConductoresDisponiblesAPIView.as_view(), name='conductores-disponibles'),
    path('conductores/', ConductoresDisponiblesAPIView.as_view(), name='conductores-list'),
    path('vehiculos/en-instalacion/', VehiculosEnInstalacionAPIView.as_view(), name='vehiculos-en-instalacion'),
    path('vehiculos/', VehiculosEnInstalacionAPIView.as_view(), name='vehiculos-list'),
    path('pendientes-salida/', PendientesSalidaAPIView.as_view(), name='pendientes-salida'),
    path('turnos/abrir/', TurnoManageAPIView.as_view(), name='turno-abrir'),
    path('turnos/cerrar/', TurnoManageAPIView.as_view(), name='turno-cerrar'),
    path('turnos/', TurnoManageAPIView.as_view(), name='turnos-list'),
    path('checklists/crear/', ChecklistCreateAPIView.as_view(), name='checklist-crear'),
    path('checklists/', ChecklistCreateAPIView.as_view(), name='checklist-list'),
]
```

---

## 4.3 Frontend - React/Vite

### 4.3.1 Servicio API (frontend/src/services/api.js)

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (username, password) =>
  api.post('/token/', { username, password });

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getProfile = () => api.get('/profile/');

// Conductores
export const getConductoresDisponibles = () =>
  api.get('/platform/conductores/disponibles/');

// Vehículos
export const getVehiculosEnInstalacion = () =>
  api.get('/platform/vehiculos/en-instalacion/');

// Registros
export const crearRegistroAcceso = (data) =>
  api.post('/platform/registros-acceso/crear/', data);

export const getPendientesSalida = () =>
  api.get('/platform/pendientes-salida/');

// Turnos
export const abrirTurno = (tipoTurno) =>
  api.post('/platform/turnos/abrir/', { action: 'abrir', tipo_turno: tipoTurno });

export const cerrarTurno = () =>
  api.post('/platform/turnos/cerrar/', { action: 'cerrar' });

export const getTurnoActivo = () =>
  api.get('/platform/turnos/');

// Checklists
export const crearChecklist = (data) =>
  api.post('/platform/checklists/crear/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default api;
```

### 4.3.2 Context de Autenticación (frontend/src/context/AuthContext.jsx)

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      apiLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await apiLogin(username, password);
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    await fetchUser();
    return response;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 4.3.3 Dashboard Page (frontend/src/pages/DashboardPage.jsx)

```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVehiculosEnInstalacion, getTurnoActivo } from '../services/api';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiculosRes, turnoRes] = await Promise.all([
        getVehiculosEnInstalacion(),
        getTurnoActivo(),
      ]);
      setVehiculos(vehiculosRes.data);
      setTurno(turnoRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.username}</span>
        </div>
      </header>

      <section className="turno-info">
        <h2>Turno: {turno?.tipo_turno || 'Sin turno'}</h2>
        <span className={`status ${turno?.abierto ? 'open' : 'closed'}`}>
          {turno?.abierto ? 'Abierto' : 'Cerrado'}
        </span>
      </section>

      <section className="stats">
        <div className="stat-card">
          <h3>{vehiculos.length}</h3>
          <p>Vehículos dentro</p>
        </div>
        <div className="stat-card">
          <h3>0</h3>
          <p>Pendientes de salida</p>
        </div>
      </section>

      <section className="vehiculos-list">
        <h3>Vehículos en Instalación</h3>
        {vehiculos.length === 0 ? (
          <p>No hay vehículos dentro</p>
        ) : (
          <ul>
            {vehiculos.map((vehiculo) => (
              <li key={vehiculo.id}>
                <strong>{vehiculo.placa}</strong>
                <span>{vehiculo.marca} {vehiculo.modelo}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav className="quick-actions">
        <Link to="/registro" className="btn btn-primary">
          Quick Registro
        </Link>
        <Link to="/checklist" className="btn btn-secondary">
          Realizar Checklist
        </Link>
      </nav>
    </div>
  );
}

export default DashboardPage;
```

---

## 4.4 Mobile - Ionic/Angular

### 4.4.1 Servicio API (Mobile/src/app/services/api.service.ts)

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';
  private storage: Storage | null = null;

  constructor(private http: HttpClient) {
    this.initStorage();
  }

  async initStorage() {
    this.storage = new Storage();
    await this.storage.create();
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.storage?.get('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  async getConductores(): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.baseUrl}/platform/conductores/disponibles/`, { headers });
  }

  async getVehiculosEnInstalacion(): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.baseUrl}/platform/vehiculos/en-instalacion/`, { headers });
  }

  async crearRegistro(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.baseUrl}/platform/registros-acceso/crear/`, data, { headers });
  }

  async abrirTurno(tipoTurno: string): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.baseUrl}/platform/turnos/abrir/`, 
      { action: 'abrir', tipo_turno: tipoTurno }, 
      { headers }
    );
  }

  async crearChecklist(data: any): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.baseUrl}/platform/checklists/crear/`, data, { headers });
  }
}
```

### 4.4.2 Quick Registro Page (Mobile/src/app/pages/quick-registro/quick-registro.page.ts)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Camera, CameraResultType } from '@capacitor/camera';

@Component({
  selector: 'app-quick-registro',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Quick Registro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="tipo-entidad">
        <h3>Tipo de Entidad</h3>
        <ion-button-group>
          <ion-button (click)="selectTipo('tracto')" [color]="tipoEntidad === 'tracto' ? 'primary' : 'medium'">
            Tractocamión
          </ion-button>
          <ion-button (click)="selectTipo('conductor')" [color]="tipoEntidad === 'conductor' ? 'primary' : 'medium'">
            Conductor
          </ion-button>
          <ion-button (click)="selectTipo('empleado')" [color]="tipoEntidad === 'empleado' ? 'primary' : 'medium'">
            Empleado
          </ion-button>
        </ion-button-group>
        <ion-button-group>
          <ion-button (click)="selectTipo('visitante')" [color]="tipoEntidad === 'visitante' ? 'primary' : 'medium'">
            Visitante
          </ion-button>
        </ion-button-group>
      </div>

      <ion-item>
        <ion-label position="stacked">Vehículo</ion-label>
        <ion-input [(ngModel)]="placa" placeholder="Ingrese placa"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Observaciones</ion-label>
        <ion-textarea [(ngModel)]="observaciones" placeholder="Observaciones"></ion-textarea>
      </ion-item>

      <ion-button expand="block" (click)="capturarFoto()">
        Capturar Evidencia
      </ion-button>

      <ion-button expand="block" color="success" (click)="confirmar()">
        Confirmar Entrada
      </ion-button>
    </ion-content>
  `,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class QuickRegistroPage {
  tipoEntidad: string = '';
  placa: string = '';
  observaciones: string = '';
  foto: string = '';

  constructor(private apiService: ApiService) {}

  selectTipo(tipo: string) {
    this.tipoEntidad = tipo;
  }

  async capturarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
      this.foto = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }

  async confirmar() {
    if (!this.tipoEntidad || !this.placa) {
      alert('Complete todos los campos');
      return;
    }

    try {
      const data = {
        tipo_entidad: this.tipoEntidad,
        tipo_movimiento: 'entrada',
        vehiculo_placa: this.placa,
        observaciones: this.observaciones,
        tiene_evidencia: !!this.foto
      };

      await this.apiService.crearRegistro(data);
      alert('Registro creado exitosamente');
    } catch (error) {
      console.error('Error creating registro:', error);
      alert('Error al crear registro');
    }
  }
}
```

### 4.4.3 Checklist Page (Mobile/src/app/pages/checklist/checklist.page.ts)

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface ChecklistItem {
  nombre: string;
  checked: boolean;
  observaciones: string;
}

@Component({
  selector: 'app-checklist',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Checklist Vehicular</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item *ngFor="let item of checklistItems">
          <ion-label>{{ item.nombre }}</ion-label>
          <ion-checkbox [(ngModel)]="item.checked" slot="start"></ion-checkbox>
          <ion-input [(ngModel)]="item.observaciones" placeholder="Obs." slot="end"></ion-input>
        </ion-item>
      </ion-list>

      <ion-item>
        <ion-label position="stacked">Observaciones generales</ion-label>
        <ion-textarea [(ngModel)]="observacionesGenerales"></ion-textarea>
      </ion-item>

      <ion-button expand="block" (click)="capturarEvidencia()">
        Capturar Evidencia Fotográfica
      </ion-button>

      <ion-button expand="block" color="success" (click)="guardar()">
        Guardar Checklist
      </ion-button>
    </ion-content>
  `,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ChecklistPage {
  checklistItems: ChecklistItem[] = [
    { nombre: 'Lluvia de golpes', checked: false, observaciones: '' },
    { nombre: 'Documentos vigentes', checked: false, observaciones: '' },
    { nombre: 'Estado de neumáticos', checked: false, observaciones: '' },
    { nombre: 'Luces y direccionales', checked: false, observaciones: '' },
    { nombre: 'Espejos', checked: false, observaciones: '' },
    { nombre: 'GPL/Cilindros', checked: false, observaciones: '' },
    { nombre: 'Tarjetón de circulación', checked: false, observaciones: '' },
    { nombre: 'Poliza de seguro', checked: false, observaciones: '' },
  ];

  observacionesGenerales: string = '';
  evidencia: string = '';

  capturarEvidencia() {
    // Implementar captura de foto
  }

  guardar() {
    const resultados = this.checklistItems.map(item => ({
      nombre: item.nombre,
      ok: item.checked,
      observaciones: item.observaciones
    }));

    console.log('Guardando checklist:', resultados);
    // Llamar al servicio API para guardar
  }
}
```

---

## 4.5 Seguridad Implementada

### 4.5.1 Configuración de Autenticación JWT

```python
# backend/checklist/urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### 4.5.2 Implementación de 2FA

```python
# backend/accounts/totp_views.py
import pyotp
from rest_framework.views import APIView
from rest_framework.response import Response

class TOTPVerifyView(APIView):
    def post(self, request):
        user = request.user
        codigo = request.data.get('codigo')
        
        # Obtener secreto del usuario (almacenado en profile)
        secreto = user.profile.totp_secret
        
        if not secreto:
            return Response({'error': '2FA no configurado'}, status=400)
        
        totp = pyotp.TOTP(secreto)
        
        if totp.verify(codigo):
            return Response({'valid': True})
        else:
            return Response({'error': 'Código inválido'}, status=400)

class TOTPSetupView(APIView):
    def post(self, request):
        user = request.user
        
        # Generar nuevo secreto
        secreto = pyotp.random_base32()
        
        # Guardar en profile
        user.profile.totp_secret = secreto
        user.profile.save()
        
        # Generar URI para QR
        totp = pyotp.TOTP(secreto)
        uri = totp.provisioning_uri(
            name=user.username,
            issuer_name='ChecklistLRA'
        )
        
        return Response({
            'secret': secreto,
            'uri': uri
        })
```

### 4.5.3 Headers de Seguridad

```python
# backend/checklist/settings.py

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CSP Configuration
CSP_DEFAULT_SRC = ("'self'",)
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
CSP_IMG_SRC = ("'self'", "data:", "blob:")
```

### 4.5.4 Rate Limiting

```python
# backend/platform_core/throttling.py
from rest_framework.throttling import UserRateThrottle

class LoginRateThrottle(UserRateThrottle):
    rate = '5/minute'  # Máximo 5 intentos de login por minuto
```

---

## 4.6 Compilación de la App Móvil

### 4.6.1 Configuración de Capacitor

```typescript
// Mobile/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lra.checklist',
  appName: 'Checklist LRA',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Camera: {
      promptLabelPhoto: 'Tomar foto',
      promptLabelPicture: 'Elegir de galería'
    }
  }
};

export default config;
```

### 4.6.2 Comandos de Build

```bash
# En la carpeta Mobile/
npm run build                    # Build de Angular
npx cap sync android            # Sincronizar con Android
npx cap open android            # Abrir en Android Studio
# En Android Studio: Build > Generate Signed APK
```

---

*Fin del Capítulo IV: Implementación*