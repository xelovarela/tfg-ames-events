# Ames Events - TFG

Aplicación web para consultar, proponer y gestionar eventos infantiles y familiares geolocalizados en Ames.

## Stack

- Frontend: React, React Router, Leaflet, Lucide React
- Backend: Node.js, Express, JWT, Multer, Sharp, Nodemailer
- Base de datos: MySQL/MariaDB con `mysql2`

## Dependencias instaladas

### Backend Node.js

Dependencias de ejecucion definidas en `backend/package.json`:

- `bcrypt`: hash y verificación de contraseñas.
- `cors`: configuración CORS para permitir peticiones desde el frontend.
- `dotenv`: carga de variables desde `backend/.env`.
- `express`: servidor HTTP y API REST.
- `jsonwebtoken`: emisión y validación de tokens JWT.
- `multer`: recepcion de imagenes subidas en formularios `multipart/form-data`.
- `mysql2`: conexion a MySQL/MariaDB con promesas.
- `nodemailer`: envio de emails de verificación, alertas y recordatorios.
- `sharp`: optimizacion de imagenes subidas a formato WebP 16:9.

Scripts disponibles:

- `npm start`: inicia el backend con `node server.js`.
- `npm run send:favorite-reminders`: ejecuta manualmente el envio de recordatorios de favoritos.
- `npm test`: ejecuta tests unitarios con el runner nativo de Node.js.

### Frontend React

Dependencias de ejecucion definidas en `frontend/package.json`:

- `react`: libreria principal de UI.
- `react-dom`: renderizado de React en navegador.
- `react-router-dom`: rutas de la SPA.
- `leaflet`: motor del mapa.
- `react-leaflet`: integración de Leaflet con React.
- `lucide-react`: iconos de la interfaz.
- `web-vitals`: métricas de rendimiento web.

Dependencias de testing y tooling incluidas por Create React App:

- `react-scripts`: scripts de desarrollo, build y test.
- `@testing-library/dom`: utilidades de testing sobre DOM.
- `@testing-library/jest-dom`: matchers de Jest para DOM.
- `@testing-library/react`: utilidades para testear componentes React.
- `@testing-library/user-event`: simulacion de interacciones de usuario en tests.

## Estado actual

- Pagina de inicio con un evento destacado, próximos eventos y CTA para proponer eventos.
- Mapa interactivo con Leaflet y agrupación de eventos por ubicación.
- **Capas contextuales del mapa**: Límite del Concello de Ames (GeoJSON), zonas de Bertamiráns y O Milladoiro (círculos aprox.), con etiquetas legibles.
- Calendario mensual de eventos en `/events/calendar`, reutilizando los filtros compartidos.
- Listado paginado, detalle, alta, edición y borrado de eventos según permisos.
- Subida de imagenes para eventos mediante `multipart/form-data`, con conversion a WebP 16:9.
- Imagenes fallback por categoria para eventos sin imagen propia, mostradas en formato 16:9, con fallback generico final.
- Registro, verificación de email, login JWT, recuperación de contraseña y perfil propio.
- Control de acceso por roles: `admin`, `content_manager` y `user`.
- Gestión de usuarios y revisión de solicitudes de acceso como creador de contenido.
- Flujo para que usuarios registrados soliciten acceso como creadores de contenido.
- Bandeja admin de solicitudes con filtros por estado y notas de revisión.
- Favoritos para usuarios registrados, administradores y gestores de contenido.
- Contadores de `favs` visibles en portada, listado y detalle de evento.
- Páginas informativas y legales estáticas enlazadas desde el footer: acerca de, contacto, ayuda, accesibilidad, privacidad, aviso legal y mapa del sitio.
- Header principal rediseñado con barra cálida tipo tarjeta, accesos rápidos con iconos y avatar desplegable.
- Footer reorganizado en columnas con enlaces informativos, aviso de no uso de cookies y licencia Creative Commons BY-NC 4.0.
- Portada ajustada a una paleta cálida coherente con el resto de la web e insignia destacada para el siguiente plan.
- Alertas por email cuándo se crean eventos que coinciden con criterios guardados por categoría, localidad, audiencia o palabra clave.
- Recordatorios por email de eventos favoritos.
- CRUD de categorías, ubicaciones, audiencias y organizadores.
- Validaciones backend y frontend para los campos principales.

### Notas actualizadas de interfaz y datos

- El buscador de eventos esta integrado en el panel de filtros, no en el header.
- El panel de filtros separa busqueda, fecha, gratuito, categorias y filtros avanzados.
- El listado `/events` pagina en cliente los eventos ya filtrados, con 9 eventos por pagina y reinicio automatico a la primera pagina cuando cambian los resultados.
- Los filtros avanzados visibles son ubicacion y audiencia.
- Las audiencias semilla quedan ordenadas por uso y edad: Todos, Bebes, Infantil, Escolar, Juvenil y Adultos.
- Los gestores pueden duplicar eventos pasados y futuros desde el listado o el detalle.

## Estructura

- `frontend/`: SPA React.
- `backend/`: API REST Express.
- `database/`: esquema y datos iniciales SQL.
- `docs/`: documentacion auxiliar del proyecto.

## Arquitectura de la aplicación

### Frontend React

El frontend es una SPA construida con React y React Router. `App` configura el `BrowserRouter`, mantiene la sesión autenticada y compone la estructura común con `AppHeader`, `AppRoutes` y `AppFooter`.

La navegación principal se concentra en `frontend/src/AppRoutes.js`, donde se separan rutas públicas, rutas autenticadas y rutas protegidas por rol mediante `ProtectedRoute`. Las pantallas viven en `frontend/src/pages`, y los componentes reutilizables como `EventList`, `EventFilters`, `EventForm` y `AmesMap` se mantienen en `frontend/src`.

El frontend consume la API con `fetch` y utilidades como `authFetch`, `favoritesApi`, `contentManagerRequestsApi` y `useFilteredEvents`. Los filtros de eventos se sincronizan con la URL para que agenda, mapa y calendario compartan búsquedas y enlaces.

### Backend Express

El backend es una API REST con Node.js y Express. `backend/server.js` configura CORS, JSON, rutas de autenticación, recursos principales y publicación de imágenes subidas. La estructura separa responsabilidades:

- `routes/`: endpoints HTTP y middleware de protección.
- `controllers/`: validación de entrada, respuestas HTTP y coordinación de servicios.
- `services/`: consultas SQL y reglas de persistencia.
- `middleware/`: validación JWT y permisos.
- `utils/`: funciones puras de validación y normalización.

La autenticación se basa en JWT. El backend adjunta el usuario autenticado a cada petición protegida y aplica restricciones de rol antes de ejecutar operaciones sensibles.

### Base de datos MySQL

La base de datos MySQL/MariaDB almacena usuarios, roles, eventos, catálogos, favoritos, alertas y solicitudes de creación de contenido. `database/schema.sql` define tablas y relaciones, y `database/seed.sql` carga datos iniciales para probar la aplicación.

Entidades principales:

- `users`, `roles`: autenticación, estado de cuenta y autorización.
- `events`: agenda con fecha, precio, audiencia, imagen y relaciones.
- `categories`, `locations`, `audiences`, `organizers`: catálogos auxiliares.
- `favorites`: relación usuario-evento.
- `alerts`: criterios guardados por usuario.
- `content_manager_requests`: solicitudes para obtener permisos de creador.

### Roles

- `user`: consulta eventos, gestiona favoritos y alertas, edita su perfil y solicita acceso como creador.
- `content_manager`: crea y edita eventos y gestiona catálogos necesarios para mantener la agenda.
- `admin`: acceso completo, incluida eliminación de eventos, gestión de usuarios, revisión de solicitudes y administración de catálogos.

Los permisos se aplican en frontend para mostrar u ocultar accesos, y en backend para bloquear peticiones no autorizadas aunque se llamen directamente a la API.

### Flujo de eventos

1. El usuario consulta la agenda, el mapa o el calendario.
2. `useFilteredEvents` carga eventos y catálogos auxiliares desde la API.
3. Los filtros de búsqueda, fecha, categoría, gratuito, ubicación y audiencia se sincronizan con la query string.
4. `EventList` muestra eventos filtrados en paginas de 9 elementos, `AmesMap` representa los mismos datos agrupados por ubicación y `EventCalendar` los organiza por día.
5. `admin` y `content_manager` pueden crear, editar, borrar y duplicar eventos con `EventForm`.
6. El backend valida datos, relaciones, imágenes y permisos antes de insertar o actualizar en MySQL.
7. Al crear eventos, el backend evalúa alertas activas y puede enviar emails si hay coincidencias.

Nota: la busqueda de eventos, los filtros de fecha, gratuito, categoria, ubicacion y audiencia se comparten entre listado, mapa y calendario mediante parametros de URL. Los gestores pueden duplicar cualquier evento para reutilizar sus datos y elegir una nueva fecha.

### Flujo de ubicaciones y mapa

Las ubicaciones se gestionan desde su CRUD y se almacenan con nombre, localidad y coordenadas. El formulario permite seleccionar coordenadas sobre el mapa y valida que la ubicación tenga datos consistentes antes de enviarla.

El mapa consume eventos ya filtrados y los agrupa por coordenadas para evitar marcadores duplicados. Además, incluye capas contextuales para identificar el límite del Concello de Ames y zonas de referencia como Bertamiráns y O Milladoiro.

### Flujo de favoritos

1. Un usuario autenticado con rol `user`, `admin` o `content_manager` puede marcar eventos como favoritos.
2. El frontend consulta `GET /favorites/ids` para saber qué eventos están marcados.
3. Al pulsar favorito, llama a `POST /favorites/:eventId` o `DELETE /favorites/:eventId`.
4. El backend comprueba JWT, permisos y existencia del evento antes de modificar `favorites`.
5. Los favoritos se muestran en `/favorites` y sirven para enviar recordatorios cuando el proceso está activo.

### Flujo de alertas

1. Un usuario autenticado crea una alerta con nombre y al menos un criterio: categoría, localidad, audiencia o palabra clave.
2. Las alertas se guardan asociadas al usuario y pueden activarse, editarse o eliminarse.
3. Cuando se crea un evento, el backend compara ese evento con las alertas activas.
4. Si hay coincidencia y la cuenta está activa y verificada, se envía un email informativo.
5. Si el envío falla, el error queda registrado pero la creación del evento no se cancela.

### Flujo de solicitudes de creación de contenido

1. Un usuario con rol `user` accede a `/propose-event` y envía una solicitud explicando por qué quiere publicar eventos.
2. La solicitud queda en estado `pending` en `content_manager_requests`.
3. El administrador revisa solicitudes desde el panel de usuarios, puede filtrar por estado y escribir notas.
4. Si aprueba la solicitud, el backend cambia el estado a `approved` y actualiza el rol del usuario a `content_manager` en una transacción.
5. Si la rechaza, la solicitud queda como `rejected`, el usuario mantiene su rol y puede consultar las notas.

## Mantenimiento de documentacion

Cada cambio funcional, tecnico o de configuración debe reflejarse en este `README.md` cuándo afecte a:

- Dependencias instaladas o scripts de `npm`.
- Variables de entorno.
- Pasos de instalacion, ejecucion, build, test o despliegue.
- Rutas frontend.
- Endpoints backend.
- Roles, permisos o flujos de usuario.
- Modelo de datos, scripts SQL o migraciones.
- Funcionalidades visibles de la aplicación.

La idea es que el README sea siempre la referencia rapida del estado real del proyecto.

## Requisitos

- Node.js 18+ recomendado.
- MySQL 8+ o MariaDB compatible.
- Servidor SMTP si se quieren probar emails reales.

## Configuracion

### Backend

Copia `backend/.env.example` como `backend/.env` y ajusta los valores:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ames_events
DB_PORT=3306
JWT_SECRET=change-this-in-production
APP_BASE_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
MAIL_FROM="Ames Events <no-reply@ames-events.local>"
PORT=3001
FAVORITE_REMINDERS_ENABLED=false
FAVORITE_REMINDERS_RUN_TIME=09:00
FAVORITE_REMINDERS_RUN_ON_START=true
CORS_ORIGINS=http://localhost:3000,https://ames-events.anxovarela.es
```

Variables opcionales para hosting de imagenes:

```env
EVENT_IMAGES_DIR=/home/your-user/api/uploads/events
EVENT_IMAGES_PUBLIC_BASE_URL=https://api.anxovarela.es
CATEGORY_IMAGES_DIR=/home/your-user/api/uploads/categories
CATEGORY_IMAGES_PUBLIC_BASE_URL=https://api.anxovarela.es
```

Si no se definen, las imagenes se guardan en `backend/uploads/events` y `backend/uploads/categories`, y se sirven desde `/uploads/events/...` o `/uploads/categories/...`.

### Frontend

Copia `frontend/.env.example` como `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

En producción, apunta esta variable al dominio de la API.

## Base de datos

Los scripts SQL no fijan el nombre de la base. Ejecutalos sobre la base objetivo:

```powershell
mysql -u root -p ames_events < database/schema.sql
mysql -u root -p ames_events < database/seed.sql
```

En hosting:

```powershell
mysql -u usuario -p nombre_base_hosting < database/schema.sql
mysql -u usuario -p nombre_base_hosting < database/seed.sql
```

El seed crea usuarios de prueba con los roles principales. Todos usan la contrasena `tfg2026`:

- `admin` / `admin@example.com`
- `usuario` / `usuario@example.com`
- `gestor` / `gestor@example.com`
- `familia` / `familia@example.com`
- `vecina` / `vecina@example.com`
- `deporte` / `deporte@example.com`
- `cultura` / `cultura@example.com`

La tabla `content_manager_requests` forma parte de `schema.sql`. El backend tambien ejecuta una comprobación defensiva y la crea automáticamente si faltase.

Para bases de datos ya existentes que no se creen desde cero, `database/add_alert_locality.sql` añade el campo `locality` a `alerts` para que las alertas puedan configurarse por localidad en lugar de limitarse a una ubicación exacta.

## Ejecucion local

### Backend

```powershell
cd backend
npm install
npm start
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

URLs por defecto:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Comprobacion API: `GET http://localhost:3001/`

## Scripts utiles

Backend:

```powershell
npm start
npm run send:favorite-reminders
npm test
```

Frontend:

```powershell
npm start
npm run build
npm test
```

## Tests automatizados

### Backend

`cd backend && npm test` ejecuta pruebas unitarias sobre utilidades puras de validación:

- Identificadores enteros positivos usados en parametros y cuerpos HTTP.
- Coordenadas geográficas de ubicaciones.
- Fechas locales de eventos en formato MySQL sin desplazamiento horario.
- Normalización de booleanos y precios antes de persistirlos.

Estas pruebas no necesitan servidor, base de datos ni variables `.env`.

### Frontend

`cd frontend && npm test` ejecuta Jest y React Testing Library. La suite actual comprueba:

- Que la aplicación renderiza la home inicial y muestra accesos principales.
- Que las URLs de imagenes de eventos se resuelven correctamente según su origen.
- Que las respuestas JSON de la API se leen bien y que los errores devuelven mensajes utiles.

Para forzar una ejecucion serial si el entorno restringe procesos worker:

```powershell
npm test -- --runInBand
```

## Rutas frontend

- `/`: home.
- `/map`: mapa de eventos con capas contextuales (límite de Ames, Bertamiráns, O Milladoiro).
- `/events`: listado y gestión de eventos.
- `/events/calendar`: calendario mensual de eventos con filtros compartidos.
- `/events/new`: crear evento, solo `admin` o `content_manager`.
- `/events/:id`: detalle de evento.
- `/events/:id/edit`: editar evento, solo `admin` o `content_manager`.
- `/favorites`: favoritos, solo `user`, `admin` o `content_manager`.
- `/alerts`: alertas del usuario autenticado.
- `/profile`: perfil propio.
- `/propose-event`: solicitud de acceso como creador de contenido.
- `/acerca-de`, `/contacto`, `/aviso-legal`, `/privacidad`, `/accesibilidad`, `/ayuda`, `/mapa-del-sitio`: páginas informativas y legales enlazadas desde el footer.
- `/admin/users`: gestión de usuarios y solicitudes de acceso como creador de contenido, solo `admin`.
- `/categories`, `/locations`, `/organizers`: catálogos para `admin` o `content_manager`.
- `/audiences`: audiencias, solo `admin`.
- `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`: autenticación.

## Interfaz pública y páginas estaticas

La zona pública de la aplicación se ha reforzado para que la experiencia sea más completa y coherente:

- La cabecera mantiene el menu lateral, marca, accesos a agenda/mapa y menu de usuario, pero con una presentación más clara, responsive y accesible.
- La home usa colores calidos, tarjetas suaves y un distintivo visual para el bloque "Siguiente plan".
- El footer se organiza en columnas: proyecto, explorar, información y legal.
- La web no utiliza cookies; por ello no existe página de política de cookies ni enlace de configuración de cookies.
- El aviso legal identifica como titular a Manuel Angel Varela Martinez y como contacto legal `admin@anxovarela.es`.
- Los contenidos propios se publican bajo licencia Creative Commons BY-NC 4.0.
- Las páginas estaticas no incluyen mensajes provisionales ni textos de tipo "[pendiente de completar]".

### Imagenes de demostracion por categoria

Los eventos pueden tener una imagen subida por el gestor en `image_url`. Si un evento no tiene imagen propia, el frontend usa una imagen de demostracion segun su categoria y, si no existe una categoria reconocida, utiliza `default-event.svg` como fallback final.

La ruta de la imagen fallback puede venir de `categories.image_url`, editable desde el gestor de categorias. La logica esta centralizada en `frontend/src/utils/eventImages.js` para que listado, portada, detalle, favoritos y otras vistas mantengan el mismo criterio visual. Las imagenes base se almacenan en `frontend/public/event-images`, se muestran en formato 16:9 y se documentan en `frontend/public/event-images/README.md`.

## Endpoints principales

### Auth

- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/login`
- `GET /auth/me`

El login devuelve un JWT y bloquea el acceso si la cuenta no está verificada o si `is_active = 0`.

### Events

- `GET /events`
- `GET /events/:id`
- `POST /events` - `admin` o `content_manager`
- `PUT /events/:id` - `admin` o `content_manager`
- `DELETE /events/:id` - `admin`

Los endpoints de creación y edición aceptan imagen en el campo `image`. El backend procesa las imagenes subidas con `sharp`, las recorta a relacion 16:9, las redimensiona a 900x506 y las guarda como `.webp`. En edición también se puede enviar `remove_image=1` para dejar el evento sin imagen propia y permitir que el frontend muestre el fallback por categoría.

### Catalogos

Categorías:

- `GET /categories`
- `GET /categories/:id`
- `POST /categories` - `admin` o `content_manager`
- `PUT /categories/:id` - `admin` o `content_manager`
- `DELETE /categories/:id` - `admin`

Ubicaciones:

- `GET /locations`
- `GET /locations/:id`
- `POST /locations` - `admin` o `content_manager`
- `PUT /locations/:id` - `admin` o `content_manager`
- `DELETE /locations/:id` - `admin`

Audiencias:

- `GET /audiences`
- `GET /audiences/:id`
- `POST /audiences` - `admin`
- `PUT /audiences/:id` - `admin`
- `DELETE /audiences/:id` - `admin`

Organizadores:

- `GET /organizers`
- `GET /organizers/:id`
- `POST /organizers` - `admin` o `content_manager`
- `PUT /organizers/:id` - `admin` o `content_manager`
- `DELETE /organizers/:id` - `admin`

Roles:

- `GET /roles` - `admin`

### Users

Perfil propio:

- `PATCH /users/me`
- `PATCH /users/me/password`

Administracion:

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/role`
- `PATCH /users/:id/status`

Defensas implementadas:

- Un admin no puede quitarse a si mismo el rol `admin`.
- Un admin no puede desactivar su propia cuenta.
- No se asignan roles inexistentes.
- No se devuelven `password_hash`, tokens de verificación ni fechas de expiracion de token.

### Content manager requests (Solicitudes de acceso como creador de contenido)

Endpoints protegidos con JWT para solicitar y revisar permisos de creación de contenido.

**Endpoints:**

- `POST /content-manager-requests` - Crear solicitud (solo usuarios con rol `user`)
- `GET /content-manager-requests/me` - Ver solicitudes del usuario autenticado
- `GET /content-manager-requests?status=pending` - Listar solicitudes (solo `admin`, con filtros por estado)
- `PATCH /content-manager-requests/:id/review` - Revisar y aprobar/rechazar solicitud (solo `admin`)

**Ejemplo de solicitud (crear):**

```json
{
  "phone": "+34 600 000 000",
  "organization_name": "Asociacion vecinal",
  "proposal_title": "Asunto de mi solicitud",
  "proposal_description": "Por qué quiero publicar eventos y qué tipo de actividades."
}
```

**Ejemplo de revisión (aprobar o rechazar):**

```json
{
  "status": "approved",
  "admin_notes": "Solicitud validada. Bienvenido como creador de contenido."
}
```

**Flujo:**

1. Un usuario normal (`user`) crea una solicitud de acceso como creador de contenido.
2. La solicitud queda en estado `pending`.
3. Un administrador (`admin`) revisa la solicitud en la sección "Solicitudes de acceso como creador de contenido".
4. Si la aprueba:
   - La solicitud cambia a estado `approved`.
   - El usuario cambia automáticamente a rol `content_manager`.
   - El usuario ya puede crear y editar eventos desde `/events/new`.
5. Si la rechaza:
   - La solicitud cambia a estado `rejected`.
   - El usuario mantiene su rol `user`.
   - El usuario puede ver las notas de rechazo.

**Validaciones implementadas:**

- Un usuario no puede crear dos solicitudes pendientes.
- Un `content_manager` o `admin` no pueden crear solicitudes.
- Una solicitud solo puede revisarse si está en estado `pending`.
- Al aprobar, se registra quién revisó y cuándo.
- La aprobación y el cambio de rol ocurren en transacción.

La pantalla admin muestra una bandeja de solicitudes con filtros `Pendientes`, `Aprobadas`, `Rechazadas` y `Todas`. 
En solicitudes pendientes, los administradores pueden:
- Ver datos del solicitante.
- Leer la motivación y datos de contacto.
- Escribir notas de revisión.
- Aprobar o rechazar con confirmación de acción.

### Favorites

Endpoints protegidos con JWT y rol `user`, `admin` o `content_manager`.

- `GET /favorites`
- `GET /favorites/ids`
- `POST /favorites/:eventId`
- `DELETE /favorites/:eventId`

### Alerts

Endpoints protegidos con JWT. Cada usuario gestiona solo sus propias alertas.

- `GET /alerts`
- `POST /alerts`
- `PUT /alerts/:id`
- `PATCH /alerts/:id/status`
- `DELETE /alerts/:id`

Una alerta debe tener nombre y al menos un criterio:

```json
{
  "name": "Teatro cerca",
  "category_id": 1,
  "locality": "Bertamiráns",
  "audience_id": null,
  "keyword": "teatro",
  "is_active": true
}
```

Cuando se crea un evento nuevo, el backend evalua las alertas activas. La localidad de la alerta se compara con la localidad de la ubicación del evento (`location_locality`), por lo que una misma alerta puede cubrir todos los espacios de Bertamiráns, Milladoiro u otras parroquias sin seleccionar un lugar exacto. Si una alerta coincide, envia un email al usuario siempre que la cuenta este activa y el email verificado. Si falla el envio, se registra el error y la creación del evento no se cancela.

## Modelo de evento

Campos principales de `events`:

- `title`: obligatorio, maximo 150 caracteres.
- `description`: opcional, maximo 2000 caracteres.
- `category_id`: obligatorio, debe existir.
- `location_id`: obligatorio, debe existir.
- `event_date`: opcional.
- `is_free`: obligatorio.
- `price`: obligatorio y mayor que 0 si `is_free = 0`.
- `audience_id`: opcional, debe existir si se informa.
- `organizer_id`: opcional, debe existir si se informa.
- `image_url`: opcional, generado al subir imagen o informado desde datos iniciales. Si queda vacio, el frontend usa la imagen fallback de la categoria y, si no existe, `default-event.svg`.

## Notas de despliegue

- Configura `CORS_ORIGINS` con los origenes reales del frontend.
- Usa un `JWT_SECRET` fuerte en producción. El backend no arranca en `NODE_ENV=production` si esta variable no existe.
- El directorio configurado en `EVENT_IMAGES_DIR` debe existir o poder crearse, y ser escribible por el proceso Node.
- Si el frontend se pública en una subruta, React usa `PUBLIC_URL` como `basename` del router y para resolver recursos públicos.
- El build de frontend se genera con:

```powershell
cd frontend
npm run build
```
