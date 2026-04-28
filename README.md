# Ames Events - TFG

Aplicacion web para consultar, proponer y gestionar eventos infantiles y familiares geolocalizados en Ames.

## Stack

- Frontend: React, React Router, Leaflet, Lucide React
- Backend: Node.js, Express, JWT, Multer, Nodemailer
- Base de datos: MySQL/MariaDB con `mysql2`

## Dependencias instaladas

### Backend Node.js

Dependencias de ejecucion definidas en `backend/package.json`:

- `bcrypt`: hash y verificacion de contrasenas.
- `cors`: configuracion CORS para permitir peticiones desde el frontend.
- `dotenv`: carga de variables desde `backend/.env`.
- `express`: servidor HTTP y API REST.
- `jsonwebtoken`: emision y validacion de tokens JWT.
- `multer`: recepcion de imagenes subidas en formularios `multipart/form-data`.
- `mysql2`: conexion a MySQL/MariaDB con promesas.
- `nodemailer`: envio de emails de verificacion, alertas y recordatorios.

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
- `react-leaflet`: integracion de Leaflet con React.
- `lucide-react`: iconos de la interfaz.
- `web-vitals`: metricas de rendimiento web.

Dependencias de testing y tooling incluidas por Create React App:

- `react-scripts`: scripts de desarrollo, build y test.
- `@testing-library/dom`: utilidades de testing sobre DOM.
- `@testing-library/jest-dom`: matchers de Jest para DOM.
- `@testing-library/react`: utilidades para testear componentes React.
- `@testing-library/user-event`: simulacion de interacciones de usuario en tests.

## Estado actual

- Pagina de inicio con un evento destacado, proximos eventos y CTA para proponer eventos.
- Mapa interactivo con Leaflet y agrupacion de eventos por ubicacion.
- **Capas contextuales del mapa**: Límite del Concello de Ames (GeoJSON), zonas de Bertamiráns y O Milladoiro (círculos aprox.), con etiquetas legibles.
- Listado, detalle, alta, edicion y borrado de eventos segun permisos.
- Subida de imagenes para eventos mediante `multipart/form-data`.
- Registro, verificacion de email, login JWT, recuperacion de contrasena y perfil propio.
- Control de acceso por roles: `admin`, `content_manager` y `user`.
- Gestion de usuarios y revision de solicitudes de acceso como creador de contenido.
- Flujo para que usuarios registrados soliciten acceso como creadores de contenido.
- Bandeja admin de solicitudes con filtros por estado y notas de revision.
- Favoritos para usuarios registrados.
- Alertas por email cuando se crean eventos que coinciden con criterios guardados.
- Recordatorios por email de eventos favoritos.
- CRUD de categorias, ubicaciones, audiencias y organizadores.
- Validaciones backend y frontend para los campos principales.

## Estructura

- `frontend/`: SPA React.
- `backend/`: API REST Express.
- `database/`: esquema, datos iniciales y scripts auxiliares SQL.
- `docs/`: documentacion auxiliar del proyecto.

## Mantenimiento de documentacion

Cada cambio funcional, tecnico o de configuracion debe reflejarse en este `README.md` cuando afecte a:

- Dependencias instaladas o scripts de `npm`.
- Variables de entorno.
- Pasos de instalacion, ejecucion, build, test o despliegue.
- Rutas frontend.
- Endpoints backend.
- Roles, permisos o flujos de usuario.
- Modelo de datos, scripts SQL o migraciones.
- Funcionalidades visibles de la aplicacion.

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
```

Si no se definen, las imagenes se guardan en `backend/uploads/events` y se sirven desde `/uploads/events/...`.

### Frontend

Copia `frontend/.env.example` como `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

En produccion, apunta esta variable al dominio de la API.

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

La tabla `content_manager_requests` forma parte de `schema.sql`. El backend tambien ejecuta una comprobacion defensiva y la crea automaticamente si faltase.

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

`cd backend && npm test` ejecuta pruebas unitarias sobre utilidades puras de validacion:

- Identificadores enteros positivos usados en parametros y cuerpos HTTP.
- Coordenadas geograficas de ubicaciones.
- Fechas locales de eventos en formato MySQL sin desplazamiento horario.
- Normalizacion de booleanos y precios antes de persistirlos.

Estas pruebas no necesitan servidor, base de datos ni variables `.env`.

### Frontend

`cd frontend && npm test` ejecuta Jest y React Testing Library. La suite actual comprueba:

- Que la aplicacion renderiza la home inicial y muestra accesos principales.
- Que las URLs de imagenes de eventos se resuelven correctamente segun su origen.
- Que las respuestas JSON de la API se leen bien y que los errores devuelven mensajes utiles.

Para forzar una ejecucion serial si el entorno restringe procesos worker:

```powershell
npm test -- --runInBand
```

## Rutas frontend

- `/`: home.
- `/map`: mapa de eventos con capas contextuales (límite de Ames, Bertamiráns, O Milladoiro).
- `/events`: listado y gestion de eventos.
- `/events/new`: crear evento, solo `admin` o `content_manager`.
- `/events/:id`: detalle de evento.
- `/events/:id/edit`: editar evento, solo `admin` o `content_manager`.
- `/favorites`: favoritos, solo `user` o `admin`.
- `/alerts`: alertas del usuario autenticado.
- `/profile`: perfil propio.
- `/propose-event`: solicitud de acceso como creador de contenido.
- `/admin/users`: gestion de usuarios y solicitudes de acceso como creador de contenido, solo `admin`.
- `/categories`, `/locations`, `/organizers`: catalogos para `admin` o `content_manager`.
- `/audiences`: audiencias, solo `admin`.
- `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`: autenticacion.

## Endpoints principales

### Auth

- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/login`
- `GET /auth/me`

El login devuelve un JWT y bloquea el acceso si la cuenta no esta verificada o si `is_active = 0`.

### Events

- `GET /events`
- `GET /events/:id`
- `POST /events` - `admin` o `content_manager`
- `PUT /events/:id` - `admin` o `content_manager`
- `DELETE /events/:id` - `admin`

Los endpoints de creacion y edicion aceptan imagen en el campo `image`.

### Catalogos

Categorias:

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
- `POST /audiences`
- `PUT /audiences/:id`
- `DELETE /audiences/:id`

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
- No se devuelven `password_hash`, tokens de verificacion ni fechas de expiracion de token.

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

Endpoints protegidos con JWT y rol `user` o `admin`.

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
  "location_id": null,
  "audience_id": null,
  "min_age": 6,
  "max_age": 12,
  "keyword": "teatro",
  "is_active": true
}
```

Cuando se crea un evento nuevo, el backend evalua las alertas activas. Si una alerta coincide, envia un email al usuario siempre que la cuenta este activa y el email verificado. Si falla el envio, se registra el error y la creacion del evento no se cancela.

## Modelo de evento

Campos principales de `events`:

- `title`: obligatorio, maximo 150 caracteres.
- `description`: opcional, maximo 2000 caracteres.
- `category_id`: obligatorio, debe existir.
- `location_id`: obligatorio, debe existir.
- `event_date`: opcional.
- `is_free`: obligatorio.
- `price`: obligatorio y mayor que 0 si `is_free = 0`.
- `min_age` y `max_age`: opcionales, pero deben ser coherentes si se informan.
- `audience_id`: opcional, debe existir si se informa.
- `organizer_id`: opcional, debe existir si se informa.
- `image_url`: opcional, generado al subir imagen o informado desde datos iniciales.

## Notas de despliegue

- Configura `CORS_ORIGINS` con los origenes reales del frontend.
- Usa un `JWT_SECRET` fuerte en produccion.
- El directorio configurado en `EVENT_IMAGES_DIR` debe existir o poder crearse, y ser escribible por el proceso Node.
- Si el frontend se publica en una subruta, React usa `PUBLIC_URL` como `basename` del router y para resolver recursos publicos.
- El build de frontend se genera con:

```powershell
cd frontend
npm run build
```
