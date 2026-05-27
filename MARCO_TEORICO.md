# MARCO TEÓRICO

El presente capítulo describe las herramientas, tecnologías y conceptos utilizados en el desarrollo del sistema de Checklist Vehicular para Logística Red Aduanera. Se abordarán desde los fundamentos del desarrollo de software hasta las tecnologías específicas implementadas en el proyecto.

---

## 1. Fundamentos del Desarrollo de Software

### 1.1 Ciclo de Vida del Software

El ciclo de vida del software (SDLC - Software Development Life Cycle) es un proceso estructurado que comprende las fases de planificación, análisis, diseño, implementación, pruebas, despliegue y mantenimiento de un sistema informático (Pressman, 2019). Este ciclo permite garantizar que el desarrollo de software siga una metodología sistemática y controlada.

#### 1.1.1 Fases del Ciclo de Vida

**Planificación y Análisis**: En esta fase se identifican los requisitos del sistema, se evalúa la viabilidad del proyecto y se define el alcance. Según Sommerville (2016), esta fase es crucial para establecer las bases del proyecto y evitar retrabajos posteriores.

**Diseño**: Se crea la arquitectura del sistema, se definen las estructuras de datos, interfaces de usuario y algoritmos. Pressman (2019) establece que un buen diseño facilita la implementación y el mantenimiento del sistema.

**Implementación**: Fase en la que se escribe el código fuente del sistema utilizando los lenguajes y herramientas seleccionados.

**Pruebas**: Se verifican que todas las funcionalidades operen correctamente y que el sistema cumpla con los requisitos establecidos.

**Despliegue**: Instalación del sistema en el entorno de producción para su uso operativo.

**Mantenimiento**: Actualizaciones correctivas y evolutivas del sistema post-implementación.

#### 1.1.2 Metodología Ágil - Scrum

Scrum es un marco de trabajo ágil que facilita el desarrollo iterativo e incremental de software. Según Schwaber y Sutherland (2020), Scrum emplea sprints (iteraciones de 2 a 4 semanas) para entregar incrementos de producto funcional.

En el presente proyecto se utilizó Scrum como metodología de desarrollo, adaptando sus roles (Product Owner, Scrum Master, Development Team) y ceremonias (Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective) a las necesidades del equipo.

**Aplicación en el proyecto**: El desarrollo del sistema de Checklist Vehicular se dividió en sprints de dos semanas, permitiendo entregas incrementales y retroalimentación continua del cliente.

---

### 1.2 Ingeniería de Software

La ingeniería de software es la aplicación de principios, métodos y herramientas para el desarrollo y mantenimiento de software de calidad (Sommerville, 2016). Esta disciplina proporciona el marco conceptual para la construcción de sistemas robustos y mantenibles.

#### 1.2.1 Análisis de Requerimientos

El análisis de requerimientos es el proceso de determinar qué necesita el sistema desde la perspectiva de los usuarios y stakeholders. Según Pressman (2019), los requerimientos funcionales describen qué debe hacer el sistema, mientras que los no funcionales describen restricciones de rendimiento, seguridad y disponibilidad.

#### 1.2.2 Diseño de Software

El diseño de software transforma los requerimientos en una arquitectura detallada que guía la implementación. Include soluciones técnicas como patrones de arquitectura cliente-servidor, bases de datos relacionales y APIs de comunicación (Bass et al., 2013).

**Aplicación en el proyecto**: Se diseñó una arquitectura cliente-servidor con REST API para la comunicación entre la aplicación móvil y el backend Django, siguiendo principios de diseño orientado a objetos y patrones de arquitectura establecidos.

---

## 2. Lenguajes de Programación

### 2.1 Python

Python es un lenguaje de programación de alto nivel, interpretado y de propósito general, creado por Guido van Rossum (2008). Se caracteriza por su sintaxis clara y legible, tipado dinámico y soporte para múltiples paradigmas de programación (funcional, orientada a objetos, imperativa).

Python ha sido adoptado ampliamente en el desarrollo web gracias a frameworks como Django, Flask y Pyramid. Según Lutz (2013), Python favorece la productividad del desarrollador gracias a su amplia biblioteca estándar y su comunidad activa.

#### 2.1.1 Características de Python

- **Interpretado**: El código se ejecuta línea por línea sin necesidad de compilación previa, facilitando el desarrollo y depuración.
- **Tipado dinámico**: Las variables se asignan automáticamente según el tipo de dato asignado.
- **Biblioteca estándar extensa**: Incluye módulos para manipulación de archivos, redes, bases de datos, entre otros.
- **Multiplataforma**: Ejecutable en Windows, Linux, macOS sin modificaciones.

#### 2.1.2 Python en el Desarrollo Web

Python ofrece frameworks web como Django, Flask y FastAPI que facilitan la creación de aplicaciones web robustas. Django, en particular, proporciona un ORM potente, sistema de templating, autenticación integrada y administración automática del sitio.

**Aplicación en el proyecto**: Python se utilizó como lenguaje principal del backend con el framework Django REST Framework, aprovechando su sintaxis legible y productividad para el desarrollo rápido de APIs REST.

---

### 2.2 TypeScript

TypeScript es un lenguaje de programación desarrollado por Microsoft que extiende JavaScript añadiendo tipado estático opcional y características orientadas a objetos (TypeScript, 2021). TypeScript se compila a JavaScript estándar, garantizando compatibilidad con todos los navegadores.

#### 2.2.1 Características de TypeScript

- **Tipado estático opcional**: Permite definir tipos de datos para variables, parámetros y返回值, detectando errores en tiempo de compilación.
- **Interfaces y tipos**: Facilita la definición de estructuras de datos complejas.
- **Clases y módulos**: Soporta programación orientada a objetos con modificadores de acceso.
- **Compatibilidad con JavaScript**: Cualquier código JavaScript válido es también código TypeScript válido.

#### 2.2.2 Ventajas sobre JavaScript

Según Anderson y otros (2018), TypeScript mejora la calidad del código en proyectos grandes al proporcionar verificación de tipos en tiempo de desarrollo, autocompletado intelligent en IDEs y refactorización segura.

**Aplicación en el proyecto**: TypeScript se utilizó en el desarrollo de la aplicación móvil con Ionic/Angular, aprovechando su tipado para reducir errores y mejorar el mantenimiento del código.

---

### 2.3 JavaScript

JavaScript es un lenguaje de programación interpretado, orientado a eventos y utilizado principalmente para el desarrollo de aplicaciones web del lado del cliente (Flanagan, 2020). Originalmente creado para agregar interactividad a páginas web, actualmente se utiliza también en servidor (Node.js) y desarrollo móvil (React Native, Ionic).

#### 2.3.1 Características de JavaScript

- **Orientado a eventos**: Permite responder a acciones del usuario como clics y teclado.
- **Manipulación del DOM**: Facilita la modificación dinámica del contenido HTML.
- **Asíncrono**: Soporta callbacks, Promises y async/await para operaciones no bloqueantes.
- **Prototipo-basado**: Implementa herencia mediante prototipos en lugar de clases.

#### 2.3.2 JSON (JavaScript Object Notation)

JSON es un formato ligero para el intercambio de datos, fácil de leer y escribir para humanos, y fácil de parsear y generar para máquinas (ECMA International, 2017). Se utiliza ampliamente en APIs REST para transmitir datos entre cliente y servidor.

**Aplicación en el proyecto**: JavaScript se utilizó en el frontend React junto con JSON para el intercambio de datos con la API REST, y la sintaxis moderna de JavaScript (ES6+) facilitó el desarrollo de componentes reactivos.

---

## 3. Tecnologías del Backend

### 3.1 Django Framework

Django es un framework web de alto nivel escrito en Python que encourage el desarrollo rápido y el diseño limpio y pragmático (Django Software Foundation, 2024). Proporciona un sistema de mapeo objeto-relacional (ORM), panel de administración automático, y herramientas para el desarrollo de APIs REST.

#### 3.1.1 Arquitectura MTV

Django sigue el patrón arquitectónico MTV (Model-Template-View):
- **Model**: Define la estructura de datos y operaciones de base de datos.
- **Template**: Presenta la interfaz de usuario con HTML dinámico.
- **View**: Contiene la lógica de negocio y procesa las peticiones HTTP.

#### 3.1.2 Características Principales

- **ORM potente**: Permite interactuar con bases de datos usando objetos Python en lugar de SQL directo.
- **Admin automático**: Genera una interfaz de administración completa basada en los modelos.
- **Sistema de templating**: Permite crear vistas HTML dinámicas con lógica mínima.
- **Seguridad integrada**: Protección contra SQL injection, XSS, CSRF por defecto.

**Aplicación en el proyecto**: Django se utilizó como framework principal del backend, aprovechando su ORM para definir los modelos de datos (Turno, RegistroAcceso, Vehiculo, Conductor, Empleado, Visitante, Checklist) y su sistema de administración para la gestión de datos.

---

### 3.2 Django REST Framework

Django REST Framework (DRF) es un kit de herramientas potente y flexible para construir APIs web en Django (Encode, 2024). Proporciona serializadores, vistas, autenticación y permisos listos para usar.

#### 3.2.1 Características de DRF

- **Serializadores**: Convierten modelos Django a JSON y viceversa.
- **Vistas basadas en clases**: Agilizan la creación de endpoints CRUD.
- **Autenticación flexible**: Soporta JWT, tokens, OAuth2.
- **Permisos granulares**: Controla acceso a nivel de objeto y recurso.
- **Documentación automática**: Genera interfaces de prueba con browsable API.

#### 3.2.2 API Views

DRF proporciona APIView como clase base para crear vistas de API, con métodos como get(), post(), put(), patch() y delete() para manejar las diferentes operaciones HTTP.

**Aplicación en el proyecto**: DRF se utilizó para crear la API REST del sistema, implementando views como RegistroAccesoCreateAPIView, ConductoresDisponiblesAPIView y PendientesSalidaAPIView para exponer los endpoints necesarios.

---

### 3.3 API REST

Una API REST (Representational State Transfer) es un estilo arquitectónico para sistemas hipermedia distribuidos, descrito por Roy Fielding (2000). Las APIs REST utilizan los métodos HTTP estándar (GET, POST, PUT, DELETE) para realizar operaciones sobre recursos identificados por URLs.

#### 3.3.1 Principios REST

- **Cliente-Servidor**: Separación de responsabilidades entre interfaz de usuario y almacenamiento de datos.
- **Sin estado**: Cada petición contiene toda la información necesaria para procesarla.
- **Cacheable**: Las respuestas pueden almacenarse en caché para mejorar el rendimiento.
- **Interfaz uniforme**: Recursos identificados mediante URIs, manipulados mediante métodos estándar.

#### 3.3.2 Formato JSON

JSON (JavaScript Object Notation) es el formato de intercambio de datos predominante en APIs REST modernas. SegúnECMA International (2017), JSON es un formato de texto ligero que facilita el parsing y la generación de datos estructurados.

**Aplicación en el proyecto**: La comunicación entre la app móvil Ionic y el backend Django se realizó mediante endpoints REST que intercambian datos en formato JSON, siguiendo los principios de diseño REST.

---

### 3.4 PostgreSQL

PostgreSQL es un sistema de gestión de bases de datos relacional de código abierto, conocido por su robustez, escalabilidad y soporte de estándares SQL (PostgreSQL Global Development Group, 2024).

#### 3.4.1 Características de PostgreSQL

- **ACID compliant**: Garantiza Atomicidad, Consistencia, Aislamiento y Durabilidad en las transacciones.
- **Tipos de datos avanzados**: Soporta JSON, arrays, rangos, tipos geométricos.
- **Índices**: Incluye índices B-tree, Hash, GiST, GIN para optimizar consultas.
- **Procedimientos almacenados**: Permite lógica de negocio en el servidor mediante pl/pgSQL.
- **Escalabilidad**: Soporta datos estructurados y no estructurados con JSONB.

#### 3.4.2 Modelo Relacional

El modelo relacional, propuesto por Codd (1970), organiza los datos en tablas (relaciones) con filas (tuplas) y columnas (atributos). Las relaciones entre tablas se establecen mediante claves primarias y foráneas.

**Aplicación en el proyecto**: PostgreSQL se utilizó como motor de base de datos, almacenando las tablas de Turno, RegistroAcceso, Vehiculo, Conductor, Empleado, Visitante, Empresa, Checklist, User y Profile con sus relaciones e integridad referencial.

---

### 3.5 Modelo de Datos del Proyecto

#### 3.5.1 Entidades Principales

**Turno**: Representa un periodo de trabajo del guardia de seguridad, con horario de apertura y cierre.

**RegistroAcceso**: Registra cada entrada y salida de vehículos y personas, distinguiendo entre tractocamiones, conductores, empleados, visitantes y empleados propios.

**Vehiculo**: Almacena información de los vehículos (placa, marca, modelo, color) y su estado (en_instalacion, conductor_actual).

**Conductor**: Registra los conductores de tractocamiones con su licencia y vehículo asociado.

**Empleado**: Personal interno de las empresas con número de empleado y empresa asociada.

**Visitante**: Personas externas que acceden a las instalaciones con motivo de visita.

**Checklist**: Resultados de la inspección vehicular realizada al entrar o salir de las instalaciones.

#### 3.5.2 Relaciones entre Entidades

- Turno (1) → RegistroAcceso (N): Un turno puede tener múltiples registros de acceso.
- Vehiculo (1) ← RegistroAcceso (N): Cada registro está asociado a un vehículo.
- Conductor (1) ← RegistroAcceso (N): Cada registro puede estar asociado a un conductor.
- RegistroAcceso (1) → Checklist (N): Un registro puede generar múltiples checklists.

---

## 4. Tecnologías del Frontend

### 4.1 React

React es una biblioteca JavaScript para construir interfaces de usuario, desarrollada por Facebook (Meta) y mantenida por una comunidad de desarrolladores (React, 2024). Utiliza un DOM virtual para optimizar las actualizaciones de la interfaz.

#### 4.1.1 Conceptos Fundamentales

- **Componentes**: Bloques de construcción reutilizables que definen parte de la interfaz.
- **JSX**: Sintaxis que permite escribir HTML dentro de JavaScript.
- **Estado (State)**: Datos internos de un componente que pueden cambiar.
- **Props**: Datos pasados de un componente padre a un hijo.
- **Hooks**: Funciones que permiten usar estado y ciclo de vida en componentes funcionales.

#### 4.1.2 useState y useEffect

useState es un hook que permite agregar estado a componentes funcionales:
```javascript
const [state, setState] = useState(initialValue);
```

useEffect es un hook que permite ejecutar efectos secundarios en componentes:
```javascript
useEffect(() => {
  // código del efecto
  return () => {
    // limpieza
  };
}, [dependencias]);
```

**Aplicación en el proyecto**: React se utilizó en el frontend web del sistema, implementando componentes funcionales con hooks para el dashboard, páginas de gestión de guardias, vehículos, empleados y generación de reportes.

---

### 4.2 Vite

Vite es una herramienta de construcción (build tool) para proyectos JavaScript modernos, creada por Evan You (2024). Ofrece tiempos de inicio instantáneos y recarga en caliente (HMR) extremadamente rápida.

#### 4.2.1 Ventajas de Vite

- **Inicio instantáneo**: No requiere bundling inicial, carga los módulos ES nativos directamente.
- **Recarga en caliente (HMR)**: Actualiza los módulos modificados sin refrescar toda la página.
- **Build rápido**: Utiliza Rollup para producción con tree-shaking y code splitting.
- **Configuración mínima**: Funciona out-of-the-box con soporte para TypeScript, JSX, CSS Modules.

#### 4.2.2 Comparación con Webpack

Webpack fue la herramienta de bundling dominante durante años, pero Vite ofrece ventajas significativas en experiencia de desarrollo (Evan You, 2020). Mientras Webpack bundla todo antes de servir, Vite sirve módulos nativos directamente en desarrollo.

**Aplicación en el proyecto**: Vite se utilizó como bundler y servidor de desarrollo para el frontend React, logrando tiempos de inicio rápidos y recarga en caliente durante el desarrollo.

---

### 4.3 Axios

Axios es una biblioteca JavaScript para realizar peticiones HTTP desde el navegador y Node.js (Axios, 2024). Proporciona una API intuitiva basada en Promises para manejar solicitudes y respuestas.

#### 4.3.1 Características de Axios

- **Soporte para Promises**: Facilita el manejo de operaciones asíncronas.
- **Interceptors**: Permite modificar peticiones o respuestas antes de enviarlas/recibirlas.
- **Transformación automática de datos**: Convierte automáticamente JSON a objetos JavaScript.
- **Cancelación de peticiones**: Soporta AbortController para cancelar solicitudes en curso.
- **Mejoras de seguridad**: Protección contra ataques de tipo CSRF.

**Aplicación en el proyecto**: Axios se utilizó en la aplicación móvil Ionic para realizar peticiones HTTP al backend Django REST API, configurado con interceptores para incluir tokens de autenticación JWT automáticamente.

---

### 4.4 Recharts y jsPDF

#### 4.4.1 Recharts

Recharts es una biblioteca de gráficos para React construida sobre componentes de D3.js (Recharts, 2024). Proporciona gráficos componibles y responsivos como líneas, barras, áreas, pasteles y personalizados.

**Aplicación en el proyecto**: Recharts se utilizó para visualizar datos de bitácora y reportes en el dashboard, incluyendo gráficos de barras y líneas para representar la actividad de accesos vehiculares.

#### 4.4.2 jsPDF

jsPDF es una biblioteca JavaScript para generar documentos PDF en el cliente (Parallax, 2024). Permite crear PDFs con texto, imágenes, tablas y gráficos.

**Aplicación en el proyecto**: jsPDF se utilizó para generar reportes en formato PDF directamente en el navegador, permitiendo a los guardias exportar bitácoras y checklists como documentos imprimibles.

---

## 5. Tecnologías Móviles

### 5.1 Ionic Framework

Ionic es un framework de código abierto para construir aplicaciones móviles híbridas multiplataforma (Ionic, 2024). Utiliza tecnologías web (HTML, CSS, JavaScript) para crear apps que funcionan en iOS, Android y web.

#### 5.1.1 Características de Ionic

- **Componentes UI**: Biblioteca extensa de componentes nativos para iOS y Android.
- **Navegación**: Sistema de rutas basado en Angular Router.
- **Animaciones**: Motor de animaciones integrado basado en Web Animations API.
- **Acceso nativo**: Plugin Capacitor para acceder a funcionalidades nativas (cámara, GPS, archivos).
- **Capacitor**: Abstraction layer que compila apps web a APKs y apps nativas.

#### 5.1.2 Angular como Base

Ionic se integra con Angular, un framework de desarrollo web mantenido por Google (Angular, 2024). Angular proporciona:
- **TypeScript por defecto**: Tipado estático para mejor calidad de código.
- **Componentes**: Bloques reutilizables con plantillas y estilos encapsulados.
- **Inyección de dependencias**: Sistema para gestionar dependencias entre servicios.
- **RxJS**: Biblioteca para programación reactiva con Observables.

**Aplicación en el proyecto**: Ionic se utilizó como framework de la aplicación móvil, permitiendo desarrollar una app que funciona como APK en dispositivos Android, con interfaz optimizada para uso en campo por guardias de seguridad.

---

### 5.2 Angular

Angular es un framework de desarrollo web front-end mantenido por Google, utilizado como base para Ionic (Angular, 2024). Angular 2+ representa una reescritura completa del framework AngularJS, con arquitectura basada en componentes.

#### 5.2.1 Arquitectura de Angular

- **Módulos**: Organizan el código en bloques cohesivos (NgModules).
- **Componentes**: Definen vistas y su comportamiento lógico.
- **Servicios e Inyección de dependencias**: Comparten lógica y datos entre componentes.
- **Enrutamiento**: Sistema de navegación basado en URL.

#### 5.2.2 TypeScript en Angular

Angular utiliza TypeScript como lenguaje predeterminado, permitiendo:
- Tipado estático para variables, funciones y objetos.
- Interfaces y tipos para definir estructuras de datos.
- Clases con modificadores de acceso (public, private, protected).
- Decoradores para definir metadatos de componentes y servicios.

**Aplicación en el proyecto**: Angular se utilizó como base de Ionic, definiendo la estructura de componentes, servicios para comunicación con la API, y módulos para organizar la funcionalidad de la app móvil.

---

### 5.3 Capacitor

Capacitor es una capa de abstracción que permite convertir aplicaciones web en aplicaciones nativas (Capacitor, 2024). Desarrollado por el equipo de Ionic, permite acceder a APIs nativas del dispositivo mediante plugins.

#### 5.3.1 Características de Capacitor

- **Compilación a APK**: Genera archivos APK para Android desde código web.
- **Plugins nativos**: Acceso a cámara, sistema de archivos, GPS, notificaciones push.
- **Actualizaciones sin tiendas**: Permite actualizar el contenido sin pasar por tiendas de apps.
- **API web para nativo**: Puentes JavaScript que invocan código nativo.

#### 5.3.2 Proceso de Build

1. Desarrollo web con Ionic/Angular.
2. Capacitor detecta cambios y sincroniza con proyectos nativos (Android Studio, Xcode).
3. Compilación del proyecto nativo genera APK/AAB para Android o IPA para iOS.

**Aplicación en el proyecto**: Capacitor se utilizó para compilar la aplicación web Ionic en un APK instalable en dispositivos Android, permitiendo la instalación directa sin pasar por Google Play Store.

---

## 6. Tecnologías de Seguridad

### 6.1 Autenticación con JWT

JSON Web Token (JWT) es un estándar abierto (RFC 7519) para transmitir información de forma segura entre partes como un objeto JSON (RFC 7519, 2015). Los JWT se utilizan para autenticación y autorización en aplicaciones web y móviles.

#### 6.1.1 Estructura de un JWT

Un JWT está compuesto por tres partes separadas por puntos:
- **Header**: Algoritmo y tipo de token (typ: JWT).
- **Payload**: Claims (afirmaciones) con información del usuario (sub, exp, iat).
- **Signature**: Firma digital que verifica la integridad del token.

Ejemplo de estructura:
```
xxxxx.yyyyy.zzzzz
Header.Payload.Signature
```

#### 6.1.2 Funcionamiento

1. El usuario inicia sesión con credenciales válidas.
2. El servidor valida las credenciales y genera un JWT conclaims del usuario.
3. El cliente recibe el JWT y lo almacena (localStorage o HttpOnly cookie).
4. En cada petición subsiguiente, el cliente incluye el JWT en el header Authorization.
5. El servidor valida la firma del JWT y extrae la información del usuario.

#### 6.1.3 Implementación con Django

Django REST Framework proporciona SimpleJWT, una biblioteca para implementar autenticación JWT. Permite configurar el tiempo de expiración, refresh tokens y algoritmos de firma.

**Aplicación en el proyecto**: Se implementó autenticación JWT para la API REST, donde cada petición de la app móvil incluye el token en el header Authorization: Bearer <token> para validar la identidad del guardia.

---

### 6.2 Autenticación de Dos Factores (2FA)

La autenticación de dos factores (2FA) añade una capa adicional de seguridad requiriendo dos tipos diferentes de verificación: algo que el usuario conoce (contraseña) y algo que posee (dispositivo móvil).

#### 6.2.1 TOTP (Time-based One-Time Password)

TOTP es un algoritmo que genera contraseñas de un solo uso basadas en el tiempo (RFC 6238, 2011). Utiliza HMAC-SHA1 para generar un código de 6 dígitos que cambia cada 30 segundos.

#### 6.2.2 Implementación

El flujo típico de TOTP es:
1. El usuario activa 2FA en su cuenta.
2. Se muestra un código QR que vincula la cuenta con una app autenticadora (Google Authenticator, Authy).
3. El servidor genera y almacena un secreto compartido encriptado.
4. Al iniciar sesión, después de la contraseña, el usuario ingresa el código de 6 dígitos.
5. El servidor valida el código comparando con el generado localmente (considerando ventana de tolerancia).

#### 6.2.3 Seguridad de TOTP

Según RFC 6238, los códigos TOTP son difíciles de replicar sin acceso al secreto compartido. La ventana de tiempo (generalmente 30 segundos) y el contador dinámico proporcionan protección contra ataques de replay.

**Aplicación en el proyecto**: Se implementó 2FA con TOTP usando pyotp en Django, donde los guardias pueden vincular su cuenta con Google Authenticator para un acceso más seguro al sistema.

---

### 6.3 Hash de Contraseñas

El hash de contraseñas es el proceso de aplicar una función criptográfica unidireccional a una contraseña para almacenarla de forma segura. Según NIST (2020), las contraseñas deben hasharse utilizando funciones adaptativas como Argon2, bcrypt o PBKDF2.

#### 6.3.1 Funciones de Hash

- **MD5**: Obsoleto, vulnerable a colisiones y ataques de fuerza bruta.
- **SHA-1**: Obsoleto, vulnerabilidad a ataques de colisión conocidos.
- **SHA-256**: Más seguro, pero no diseñado originalmente para contraseñas.
- **bcrypt**: Diseñado para contraseñas, incluye factor de costo computational.
- **Argon2**: Ganador de la Password Hashing Competition, configuración flexible.
- **PBKDF2**: Función de derivación de claves con iteraciones configurables.

#### 6.3.2 Django y el Hash de Contraseñas

Django utiliza PBKDF2 por defecto con 600,000 iteraciones (a partir de Django 4.0), almacenando el hash en formato: algoritmo$salt$iteraciones$hash. Esto proporciona protección robusta contra ataques de diccionario y fuerza bruta.

**Aplicación en el proyecto**: Las contraseñas de los usuarios se almacenan utilizando el sistema de hash de Django (PBKDF2-SHA256), garantizando que ninguna contraseña real se almacena en la base de datos.

---

### 6.4 OWASP Top 10

El OWASP Top 10 es un documento de conciencia sobre seguridad que enumera las vulnerabilidades más críticas en aplicaciones web (OWASP, 2021). Es widely adoptado como referencia para desarrolladores y auditores de seguridad.

#### 6.4.1 Vulnerabilidades del OWASP Top 10

**A01: Broken Access Control**: Restricciones inadecuadas sobre lo que usuarios autenticados pueden hacer.

**A02: Cryptographic Failures**: Fallos en la protección de datos sensibles (exposición de datos, criptografía débil).

**A03: Injection**: Código malicioso insertado en consultas (SQL, NoSQL, OS command injection).

**A04: Insecure Design**: Diseño arquitectónico sin controles de seguridad suficientes.

**A05: Security Misconfiguration**: Configuraciones incorrectas de servidores, frameworks y dependencias.

**A06: Vulnerable and Outdated Components**: Componentes con vulnerabilidades conocidas sin actualizar.

**A07: Identification and Authentication Failures**: Debilidades en funciones de autenticación.

**A08: Software and Data Integrity Failures**: Codificación insegura que asume datos de CDN o CI/CD sin validación.

**A09: Security Logging and Monitoring Failures**: Ausencia de registro y monitoreo para detectar intrusiones.

**A10: Server-Side Request Forgery (SSRF)**: Fetching URLs del lado del servidor sin validar la entrada del usuario.

**Aplicación en el proyecto**: Se aplicaron contramedidas para cada categoría OWASP Top 10, incluyendo validación de entrada, parametrización de consultas SQL, manejo correcto de sesiones y errores, y configuración de headers de seguridad.

---

### 6.5 ciberseguridad en Aplicaciones Web y Móviles

La ciberseguridad es el conjunto de prácticas, tecnologías y procesos diseñados para proteger sistemas, redes y datos de ataques digitales (Whitman y Mattord, 2022).

#### 6.5.1 Principios de Seguridad

- **Confidencialidad**: Solo usuarios autorizados acceden a la información.
- **Integridad**: La información no se modifica sin autorización.
- **Disponibilidad**: Los sistemas están disponibles cuando se necesitan.

#### 6.5.2 HTTPS y TLS/SSL

HTTPS (Hypertext Transfer Protocol Secure) utiliza TLS (Transport Layer Security) para cifrar la comunicación entre cliente y servidor. TLS proporciona:
- **Cifrado**: Datos ilegibles para interceptores.
- **Autenticación**: Verificación de identidad del servidor mediante certificados.
- **Integridad**: Detección de manipulación de datos en tránsito.

#### 6.5.3 Headers de Seguridad

Los headers HTTP de seguridad configuran políticas de protección en navegadores:
- **Content-Security-Policy (CSP)**: Controla recursos que pueden cargarse.
- **X-Content-Type-Options**: Previene MIME type sniffing.
- **X-Frame-Options**: Previene clickjacking.
- **Strict-Transport-Security (HSTS)**: Fuerza HTTPS.
- **X-XSS-Protection**: Protección contra XSS (deprecated en navegadores modernos).

#### 6.5.4 Rate Limiting

El rate limiting controla el número de peticiones que un usuario puede realizar en un período de tiempo, protegiendo contra ataques de denegación de servicio (DoS) y fuerza bruta. Implementado en Django mediante middleware throttling.

**Aplicación en el proyecto**: Se configuraron headers de seguridad en Django (django-security middleware), HTTPS obligatorio, rate limiting en endpoints de autenticación, y validación estricta de entradas.

---

### 6.6 DevSecOps

DevSecOps integra seguridad en cada fase del ciclo de vida de desarrollo de software, desde la planificación hasta el despliegue y monitoreo (OWASP, 2024).

#### 6.6.1 Automatización de Seguridad

- **SAST (Static Application Security Testing)**: Análisis de código fuente sin ejecutar para detectar vulnerabilidades.
- **DAST (Dynamic Application Security Testing)**: Pruebas en runtime contra aplicaciones desplegadas.
- **SCA (Software Composition Analysis)**: Análisis de dependencias para vulnerabilidades conocidas.

#### 6.6.2 Herramientas de Seguridad

- **Bandit**: Analizador estático de código Python que detecta vulnerabilidades de seguridad.
- **OWASP ZAP**: Proxy de pruebas de seguridad para aplicaciones web.
- **Dependabot/Snyk**: Escaneo de dependencias para vulnerabilidades conocidas.

**Aplicación en el proyecto**: Se utilizó Bandit para análisis estático del código Python del backend, verificando que no existan vulnerabilidades como SQL injection, hardcoded credentials o uso de funciones criptográficas inseguras.

---

## 7. Conceptos del Dominio del Proyecto

### 7.1 Control de Accesos Vehiculares

El control de accesos vehiculares es el proceso de gestionar y registrar la entrada y salida de vehículos en instalaciones restringidas. Según esta definición, involucra la verificación de identidad del conductor, validación del vehículo, y registro de movimientos.

#### 7.1.1 Checklists de Inspección

Un checklist de inspección vehicular es un formulario estructurado que registra el estado de un vehículo al entrar o salir de las instalaciones. Incluye verificación de condiciones físicas, documentos vigentes y evidencia fotográfica.

#### 7.1.2 Tipos de Entidades

El sistema maneja diferentes tipos de entidades que acceden a las instalaciones:
- **Tractocamión**: Vehículos de carga pesada con remolque, operados por conductores asignados.
- **Conductor**: Personal que opera tractocamiones, puede acceder sin vehículo en algunos casos.
- **Empleado**: Personal interno de empresas Logistic Red Aduanera, accede con vehículo propio.
- **Visitante**: Personas externas que acceden por motivos específicos (reuniones, entregas).

#### 7.1.3 Estados del Vehículo

- **en_instalacion**: Indica si el vehículo se encuentra actualmente dentro de las instalaciones.
- **conductor_pendiente_salida**: Indica si el conductor no ha registrado su salida.
- **conductor_actual**: Referencia al conductor que está operando actualmente el vehículo.

**Aplicación en el proyecto**: El sistema implementa el control de accesos vehiculares mediante registros de entrada y salida, checklists de inspección, y validación de estados para garantizar que tractocamiones y conductores no salgan sin registrar su salida.

---

### 7.2 Turnos de Seguridad

Los turnos de seguridad organizan el trabajo de los guardias en períodos definidos, permitiendo control de horarios y trazabilidad de actividades.

#### 7.2.1 Estructura del Turno

- **Horario de apertura**: Momento en que el guardia inicia su turno.
- **Horario de cierre**: Momento en que el guardia termina su turno.
- **Estado (abierto/cerrado)**: Indica si el turno está activo.
- **Tipo de turno**: Configurable según necesidades operativas.

**Aplicación en el proyecto**: Cada guardia debe abrir un turno al iniciar su jornada, y cerrarlo al finalizar. Todos los registros de acceso quedan asociados al turno activo.

---

### 7.3 Bitácora de Accesos

La bitácora es un registro cronológico de todas las entradas y salidas, proporcionando trazabilidad completa de la actividad en las instalaciones.

#### 7.3.1 Datos Registrados

- Fecha y hora del movimiento.
- Tipo de movimiento (entrada/salida).
- Tipo de entidad (tracto/conductor/empleado/visitante).
- Identificación del vehículo, conductor, empleado o visitante.
- Observaciones del guardia.
- Evidencia fotográfica.
- Turno al que pertenece el registro.

**Aplicación en el proyecto**: Cada registro de acceso genera una entrada en la bitácora, consultable por fecha, tipo de entidad, tipo de movimiento, y exportable a PDF.

---

## 8. Resumen de Tecnologías Utilizadas

| Categoría | Tecnología | Versión/Año |
|-----------|------------|-------------|
| **Backend** | Python | 3.10+ |
| **Framework Web** | Django | 4.2+ |
| **API REST** | Django REST Framework | 3.14+ |
| **Base de Datos** | PostgreSQL | 15+ |
| **Frontend Web** | React | 18+ |
| **Bundler** | Vite | 5+ |
| **Peticiones HTTP** | Axios | 1.6+ |
| **Gráficos** | Recharts | 2.10+ |
| **Generación PDF** | jsPDF | 2.5+ |
| **Mobile Framework** | Ionic | 7+ |
| **Mobile Base** | Angular | 17+ |
| **Lenguaje Móvil** | TypeScript | 5+ |
| **Compilación Móvil** | Capacitor | 6+ |
| **Autenticación** | JWT (SimpleJWT) | - |
| **2FA** | pyotp (TOTP) | - |
| **Análisis Estático** | Bandit | - |

---

## 9. Arquitectura del Sistema

### 9.1 Arquitectura Cliente-Servidor

El sistema sigue una arquitectura cliente-servidor de tres capas:

1. **Capa de Presentación (Cliente)**: Aplicación móvil Ionic/Angular que interactúa con el usuario.
2. **Capa de Lógica de Negocio (Servidor)**: Backend Django REST API que procesa solicitudes.
3. **Capa de Datos**: Base de datos PostgreSQL que almacena la información.

### 9.2 comunicación entre Componentes

- App móvil → HTTP REST → API Django → ORM Django → PostgreSQL
- API Django → Serializers JSON → App móvil
- Tokens JWT validan cada comunicación

---

## Referencias

Anderson, C., Franciscani, F., Vredevoogd, M., & West, D. (2018). *TypeScript Deep Dive*. GitHub. https://github.com/basarat/typescript-book

Axios. (2024). axios. https://axios-http.com/

Bass, L., Clements, P., & Kazman, R. (2013). *Software Architecture in Practice* (3rd ed.). Addison-Wesley.

Capacitor. (2024). Capacitor: The way to web native apps. https://capacitorjs.com/

Codd, E. F. (1970). A Relational Model of Data for Large Shared Data Banks. *Communications of the ACM*, 13(6), 377-387.

Django Software Foundation. (2024). Django. https://www.djangoproject.com/

ECMA International. (2017). ECMA-404: The JSON Data Interchange Syntax. https://www.ecma-international.org/

Encode. (2024). Django REST Framework. https://www.django-rest-framework.org/

Fielding, R. T. (2000). Architectural Styles and the Design of Network-based Software Architectures (Doctoral dissertation). University of California, Irvine.

Flanagan, D. (2020). *JavaScript: The Definitive Guide* (7th ed.). O'Reilly Media.

Ionic. (2024). Ionic Framework. https://ionicframework.com/

Lutz, M. (2013). *Learning Python* (5th ed.). O'Reilly Media.

NIST. (2020). Digital Identity Guidelines. https://doi.org/10.6028/NIST.SP.800-63b

OWASP. (2021). OWASP Top 10:2021. https://owasp.org/Top10/

OWASP. (2024). OWASP DevSecOps Guideline. https://owasp.org/www-project-devsecops/

PostgreSQL Global Development Group. (2024). PostgreSQL. https://www.postgresql.org/

Pressman, R. S. (2019). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.

React. (2024). React. https://react.dev/

Recharts. (2024). Recharts. https://recharts.org/

RFC 6238. (2011). TOTP: Time-based One-time Password Algorithm. https://datatracker.ietf.org/doc/html/rfc6238

RFC 7519. (2015). JSON Web Token (JWT). https://datatracker.ietf.org/doc/html/rfc7519

Schwaber, K., & Sutherland, J. (2020). The Scrum Guide. https://scrumguides.org/

Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.

TypeScript. (2021). TypeScript Documentation. https://www.typescriptlang.org/docs/

Van Rossum, G. (2008). Python Programming Language. https://www.python.org/

Vite. (2024). Vite. https://vitejs.dev/

Whitman, M. E., & Mattord, H. J. (2022). *Principles of Information Security* (7th ed.). Cengage Learning.

You, E. (2020). Vite. https://vitejs.dev/

---

*Documento elaborado como parte del proyecto de titulación: Sistema de Checklist Vehicular para Logística Red Aduanera*