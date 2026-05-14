# Diagrama UML - Sistema Checklist Vehicular

## 1. Arquitectura General

```mermaid
graph TB
    subgraph "Cliente Móvil"
        APP[Ionic/Angular<br/>App Móvil]
    end

    subgraph "Servidor"
        API[Django REST API]
        ADMIN[Django Admin<br/>Panel Web]
    end

    subgraph "Base de Datos"
        DB[(PostgreSQL<br/>SQLite)]
    end

    APP --> |"HTTP/REST"| API
    ADMIN --> |"Django ORM"| API
    API --> |"SQL"| DB
```

---

## 2. Modelo de Dominio (Class Diagram)

```mermaid
classDiagram
    class Turno {
        +Integer id
        +Guardia guardia
        +DateTime fecha_apertura
        +DateTime fecha_cierre
        +CharField tipo_turno
        +Boolean abierto
        +create()
        +close()
    }

    class RegistroAcceso {
        +Integer id
        +Turno turno
        +CharField tipo_movimiento
        +CharField tipo_entidad
        +Vehiculo vehiculo
        +Conductor conductor
        +Empleado empleado
        +Visitante visitante
        +DateTime fecha_hora
        +Boolean conductor_pendiente_salida
        +TextField observaciones
        +Boolean tiene_evidencia
        +ImageField evidencia_fotografica
        +RegistroAcceso entrada_asociada
    }

    class Vehiculo {
        +Integer id
        +CharField placa
        +CharField clave_interna
        +CharField tipo_entidad
        +CharField marca
        +CharField modelo
        +CharField color
        +Boolean en_instalacion
        +Conductor conductor_actual
        +Empleado ultimo_empleado
    }

    class Conductor {
        +Integer id
        +CharField nombre_completo
        +CharField numero_licencia
        +Boolean activo
        +Vehiculo vehiculo
    }

    class Empleado {
        +Integer id
        +CharField nombre_completo
        +CharField numero_empleado
        +Boolean activo
        +Empresa empresa
    }

    class Empresa {
        +Integer id
        +CharField nombre
        +Boolean activa
    }

    class Visitante {
        +Integer id
        +CharField nombre
        +CharField apellido
        +CharField telefono
        +CharField motivo_visita
    }

    class Checklist {
        +Integer id
        +RegistroAcceso registro_acceso
        +JSONField resultados
        +TextField observaciones
        +ImageField evidencia_fotografica
        +DateTime fecha_creacion
        +User evaluador
    }

    class User {
        +Integer id
        +CharField username
        +CharField email
        +Profile perfil
    }

    class Profile {
        +Integer id
        +CharField nombre_completo
        +CharField role
        +Boolean activo
    }

    Turno "1" --> "N" RegistroAcceso
    RegistroAcceso "N" --> "1" Vehiculo
    RegistroAcceso "N" --> "1" Conductor
    RegistroAcceso "N" --> "1" Empleado
    RegistroAcceso "N" --> "1" Visitante
    RegistroAcceso "1" --> "0..1" RegistroAcceso : entrada_asociada
    RegistroAcceso "1" --> "1" Turno
    Vehiculo "1" --> "0..1" Conductor : conductor_actual
    Vehiculo "1" --> "0..1" Empleado : ultimo_empleado
    Empleado "N" --> "1" Empresa
    RegistroAcceso "1" --> "N" Checklist
    Checklist "N" --> "1" User
    User "1" --> "1" Profile
```

---

## 3. Diagrama de Entidad-Relación (ER)

```mermaid
erDiagram
    TURNO ||--o{ REGISTRO_ACCESO : tiene
    REGISTRO_ACCESO }o--|| VEHICULO : asocia
    REGISTRO_ACCESO }o--|| CONDUCTOR : registra
    REGISTRO_ACCESO }o--|| EMPLEADO : registra
    REGISTRO_ACCESO }o--|| VISITANTE : registra
    REGISTRO_ACCESO ||--o| REGISTRO_ACCESO : salida_asociada
    VEHICULO ||--o| CONDUCTOR : conductor_actual
    VEHICULO ||--o| EMPLEADO : ultimo_empleado
    EMPLEADO ||--|| EMPRESA : pertenece
    REGISTRO_ACCESO ||--o{ CHECKLIST : genera
    CHECKLIST }o--|| USER : evaluador
    USER ||--|| PROFILE : tiene

    TURNO {
        int id PK
        int guardia_id FK
        datetime fecha_apertura
        datetime fecha_cierre
        string tipo_turno
        boolean abierto
    }

    VEHICULO {
        int id PK
        string placa UK
        string clave_interna
        string tipo_entidad
        string marca
        string modelo
        string color
        boolean en_instalacion
        int conductor_actual_id FK
        int ultimo_empleado_id FK
    }

    CONDUCTOR {
        int id PK
        string nombre_completo
        string numero_licencia
        boolean activo
        int vehiculo_id FK
    }

    EMPLEADO {
        int id PK
        string nombre_completo
        string numero_empleado
        boolean activo
        int empresa_id FK
    }

    EMPRESA {
        int id PK
        string nombre
        boolean activa
    }

    VISITANTE {
        int id PK
        string nombre
        string apellido
        string telefono
        string motivo_visita
    }

    REGISTRO_ACCESO {
        int id PK
        int turno_id FK
        string tipo_movimiento
        string tipo_entidad
        int vehiculo_id FK
        int conductor_id FK
        int empleado_id FK
        int visitante_id FK
        datetime fecha_hora
        boolean conductor_pendiente_salida
        text observaciones
        boolean tiene_evidencia
        image evidencia_fotografica
        int entrada_asociada_id FK
    }

    CHECKLIST {
        int id PK
        int registro_acceso_id FK
        json resultados
        text observaciones
        image evidencia_fotografica
        datetime fecha_creacion
        int evaluador_id FK
    }

    USER {
        int id PK
        string username UK
        string email
        int profile_id FK
    }

    PROFILE {
        int id PK
        string nombre_completo
        string role
        boolean activo
    }
```

---

## 4. Casos de Uso (Use Case Diagram)

```mermaid
graph LR
    subgraph "Sistema Checklist Vehicular"
        E1[("Registrar Entrada<br/>Tractocamión")]
        E2[("Registrar Salida<br/>Tractocamión")]
        E3[("Registrar Entrada<br/>Conductor")]
        E4[("Registrar Salida<br/>Conductor")]
        E5[("Registrar Entrada<br/>Empleado")]
        E6[("Registrar Salida<br/>Empleado")]
        E7[("Registrar Entrada<br/>Visitante")]
        E8[("Registrar Salida<br/>Visitante")]
        E9[("Registrar Entrada<br/>Empleado Propio")]
        E10[("Registrar Salida<br/>Empleado Propio")]
        C1[("Realizar Checklist<br/>Tractocamión")]
        C2[("Abrir/Cerrar<br/>Turno")]
        C3[("Consultar<br/>Historial")]
        C4[("Ver Vehículos<br/>en Instalación")]
        C5[("Ver Pendientes<br/>de Salida")]
    end

    subgraph "Actor"
        G[("Guardia")]
    end

    G --> E1
    G --> E2
    G --> E3
    G --> E4
    G --> E5
    G --> E6
    G --> E7
    G --> E8
    G --> E9
    G --> E10
    G --> C1
    G --> C2
    G --> C3
    G --> C4
    G --> C5
```

---

## 5. Flujo de Registrar Entrada

```mermaid
sequenceDiagram
    participant G as Guardia
    participant APP as App Móvil
    participant API as Django API
    participant DB as Base de Datos

    G->>APP: Selecciona "Entrada"
    G->>APP: Elige tipo de entidad
    G->>APP: Ingresa datos según tipo

    alt Entrada Tractocamión
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='tracto', vehiculo_id, conductor_id
        API->>DB: Verificar vehículo no está dentro
        API->>DB: Verificar conductor no tiene entrada pendiente
        API->>DB: Crear RegistroAcceso (conductor_pendiente_salida=True)
        API->>DB: Actualizar Vehiculo.en_instalacion=True
        API->>DB: Actualizar Vehiculo.conductor_actual
    end

    alt Entrada Conductor (sin vehículo)
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='conductor', conductor_id
        API->>DB: Verificar conductor no tiene entrada pendiente
        API->>DB: Crear RegistroAcceso (conductor_pendiente_salida=True)
        API->>DB: Si conductor tiene vehículo: Vehiculo.en_instalacion=True
    end

    alt Entrada Empleado
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='empleado', empleado_id, vehiculo_id
        API->>DB: Verificar vehículo no está dentro
        API->>DB: Crear RegistroAcceso
        API->>DB: Actualizar Vehiculo.en_instalacion=True
    end

    alt Entrada Visitante
        APP->>APP: Captura foto evidencia
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='visitante', datos, foto
        API->>DB: Crear RegistroAcceso
    end

    API-->>APP: 201 Created
    APP-->>G: "Entrada registrada exitosamente"
```

---

## 6. Flujo de Registrar Salida

```mermaid
sequenceDiagram
    participant G as Guardia
    participant APP as App Móvil
    participant API as Django API
    participant DB as Base de Datos

    G->>APP: Selecciona "Salida"
    APP->>APP: Muestra pendientes de salida

    alt Salida Tractocamión
        G->>APP: Selecciona tracto de lista
        APP->>APP: Captura foto evidencia
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='tracto', vehiculo_id, conductor_id
        API->>DB: Verificar Vehiculo.en_instalacion=True
        API->>DB: Verificar Vehiculo.conductor_actual == conductor_id
        API->>DB: Crear RegistroAcceso salida
        API->>DB: Actualizar Vehiculo.en_instalacion=False
        API->>DB: Actualizar Vehiculo.conductor_actual=None
        API->>DB: Limpiar conductor_pendiente_salida en entradas del conductor
    end

    alt Salida Conductor (sale sin vehículo)
        G->>APP: Selecciona conductor de lista
        APP->>APP: Captura foto evidencia
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='conductor', conductor_id
        API->>DB: Buscar entrada pendiente del conductor
        API->>DB: Crear RegistroAcceso salida
        API->>DB: Limpiar conductor_pendiente_salida
        API->>DB: Si conductor tiene vehículo: Vehiculo.en_instalacion=False
    end

    alt Salida Empleado
        G->>APP: Selecciona empleado de lista
        APP->>APP: Captura foto evidencia
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='empleado', vehiculo_id, empleado_id
        API->>DB: Crear RegistroAcceso salida
        API->>DB: Actualizar Vehiculo.en_instalacion=False
    end

    alt Salida Visitante
        G->>APP: Selecciona visitante de lista
        APP->>APP: Captura foto evidencia
        APP->>API: POST /registros-acceso/crear<br/>tipo_entidad='visitante', visitante_id
        API->>DB: Crear RegistroAcceso salida
    end

    API-->>APP: 201 Created
    APP-->>G: "Salida registrada exitosamente"
```

---

## 7. Diagrama de Componentes

```mermaid
graph TB
    subgraph "Mobile App (Ionic/Angular)"
        UI["UI Components<br/>Ionic Components"]
        PAGES["Pages<br/>- quick-registro<br/>- vehiculos-dentro<br/>- checklist<br/>- historial<br/>- dashboard-guardia"]
        SERVICES["Services<br/>- api.service.ts<br/>- auth.service.ts"]
        MODELS["Models/Interfaces"]
    end

    subgraph "Backend (Django REST)"
        VIEWS["API Views<br/>- RegistroAccesoCreateAPIView<br/>- ConductoresDisponiblesAPIView<br/>- VehiculosEnInstalacionAPIView<br/>- PendientesSalidaAPIView"]
        SERIALIZERS["Serializers"]
        MODELS["Models<br/>- Turno<br/>- RegistroAcceso<br/>- Vehiculo<br/>- Conductor<br/>- Empleado<br/>- Visitante<br/>- Checklist"]
        URLS["URL Routes"]
        ADMIN["Django Admin"]
    end

    subgraph "Base de Datos"
        DB[(PostgreSQL<br/>SQLite)]
    end

    UI --> PAGES
    PAGES --> SERVICES
    Services --> MODELS
    VIEWS --> SERIALIZERS
    SERIALIZERS --> MODELS
    MODELS --> DB
    VIEWS --> URLS
    URLS --> API
    API --> |"HTTP REST"| Services
```

---

## 8. Diagrama de Estados - Vehículo

```mermaid
stateDiagram-v2
    [*] --> Disponible

    state "Tractocamión" as TT {
        [*] --> FueraInstalacion
        FueraInstalacion --> DentroInstalacion : ENTRADA<br/>conductor_pendiente_salida=True
        DentroInstalacion --> FueraInstalacion : SALIDA<br/>conductor_actual=None<br/>en_instalacion=False
    }

    state "Empleado/Visitante" as EV {
        [*] --> VehiculoDisponible
        VehiculoDisponible --> VehiculoDentro : ENTRADA<br/>en_instalacion=True
        VehiculoDentro --> VehiculoDisponible : SALIDA<br/>en_instalacion=False
    }

    state "Conductor" as COND {
        [*] --> ConductorFuera
        ConductorFuera --> ConductorDentro : ENTRADA<br/>conductor_pendiente_salida=True
        ConductorDentro --> ConductorFuera : SALIDA<br/>conductor_pendiente_salida=False
    }
```

---

## 9. Tipos de Entidad y Movimientos

```mermaid
graph LR
    subgraph "tipo_entidad"
        T1["tracto"]
        T2["conductor"]
        T3["empleado"]
        T4["visitante"]
        T5["empleado_propio"]
    end

    subgraph "tipo_movimiento"
        M1["entrada"]
        M2["salida"]
    end

    subgraph "Validaciones"
        V1["conductor_pendiente_salida"]
        V2["en_instalacion"]
    end

    T1 --> M1 : Crea registro<br/>conductor_pendiente_salida=True
    T1 --> M2 : Requiere evidencia<br/>Actualiza Vehiculo
    T2 --> M1 : Crea registro<br/>conductor_pendiente_salida=True
    T2 --> M2 : Requiere evidencia<br/>Limpia pendientes
    T3 --> M1 : Requiere vehiculo<br/>en_instalacion=True
    T3 --> M2 : Requiere evidencia<br/>en_instalacion=False
    T4 --> M1 : Sin validaciones<br/>conductor_pendiente_salida=True
    T4 --> M2 : Requiere evidencia
    T5 --> M1 : Crea registro<br/>conductor_pendiente_salida=True
    T5 --> M2 : Requiere evidencia
```

---

## 10. Relación Conductor - Vehículo

```mermaid
graph TB
    subgraph "FLUJO: Conductor de Tractocamión"
        C1[("Conductor<br/>Juan Pérez")]
        V1[("Tractocamión<br/>TRA-001")]
        R1[("Registro ENTRADA<br/>tipo_entidad='conductor'")]
        R2[("Registro SALIDA<br/>conductor sale solo")]

        C1 --> R1
        V1 --> |en_instalacion=True| V1
        R1 --> |conductor.vehiculo.en_instalacion=True| V1
        C1 --> R2
        R2 --> |conductor_pendiente_salida=False| R1
        R2 --> |en_instalacion=False| V1
    end

    subgraph "FLUJO: Tractocamión completo"
        C2[("Conductor<br/>Roberto Carlos")]
        V2[("Tractocamión<br/>TRA-002")]
        R3[("Registro ENTRADA<br/>tipo_entidad='tracto'")]
        R4[("Registro SALIDA<br/>conductor + tracto")]

        C2 --> R3
        V2 --> |conductor_actual=C2| V2
        R3 --> |conductor_pendiente_salida=True| R3
        V2 --> |en_instalacion=True| V2
        C2 --> R4
        V2 --> |conductor_actual=None| V2
        V2 --> |en_instalacion=False| V2
        R4 --> |conductor_pendiente_salida=False| R3
    end
```

---

## 11. endpoints API

```mermaid
graph LR
    subgraph "Endpoints Principales"
        E1["POST /api/platform/registros-acceso/crear/"]
        E2["GET /api/platform/registros-acceso/"]
        E3["GET /api/platform/registros-acceso/pendientes-salida/"]
        E4["GET /api/platform/conductores/disponibles/"]
        E5["GET /api/platform/conductores/"]
        E6["GET /api/platform/vehiculos/en-instalacion/"]
        E7["GET /api/platform/empleados/"]
        E8["GET /api/platform/asignaciones/empleados-con-vehiculo-disponible/"]
        E9["GET /api/platform/checklists/"]
        E10["POST /api/platform/checklists/crear/"]
        E11["GET /api/platform/turnos/"]
        E12["POST /api/platform/turnos/abrir/"]
        E13["POST /api/platform/turnos/cerrar/"]
    end
```

---

## 12. Notas de Implementación

### Campos clave en RegistroAcceso

| Campo | Descripción |
|-------|-------------|
| `tipo_entidad` | tracto, conductor, empleado, visitante, empleado_propio |
| `tipo_movimiento` | entrada, salida |
| `conductor_pendiente_salida` | Indica si el conductor aún no ha registrado salida |
| `en_instalacion` | En Vehiculo, indica si está dentro de la instalación |
| `conductor_actual` | En Vehiculo, referencia al conductor manejando |

### Reglas de Negocio

1. **Tractocamión**: Solo puede entrar/salir con su conductor asignado
2. **Conductor**: Puede entrar sin vehículo, pero debe registrar salida sin vehículo
3. **Empleado**: Puede dejar vehículo dentro si tiene fallas (registra salida sin vehículo)
4. **Visitante**: No tiene vehículo propio en el sistema
5. **conductor_pendiente_salida**: Se usa para filtrar pendientes de salida
