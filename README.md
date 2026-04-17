# Ames Events - TFG

Aplicacion web para gestionar y visualizar eventos infantiles geolocalizados en Ames.

## Stack
- Frontend: React + Leaflet
- Backend: Node.js + Express (REST API)
- Base de datos: MySQL

## Estado Actual
- Mapa interactivo con Leaflet y agrupacion de eventos por ubicacion.
- Registro, verificacion de email y login con JWT.
- Control de acceso por roles: `admin`, `content_manager` y `user`.
- Gestion de usuarios para administradores.
- Favoritos de eventos para usuarios registrados.
- Alertas de eventos por email para usuarios autenticados.
- CRUD de eventos.
- CRUD completo de categorias.
- CRUD completo de ubicaciones.
- CRUD completo de audiencias.
- CRUD completo de organizadores.
- Validaciones backend y frontend para datos clave.
- Modelo `events` actualizado a v5 con:
  - `event_date`
  - `is_free`
  - `price`
  - `min_age`
  - `max_age`
  - `audience_id`
  - `organizer_id`
  - `description`

## Estructura
- `frontend/`: SPA React
- `backend/`: API Express
- `database/`: schema y seed SQL

## Requisitos
- Node.js 18+ (recomendado)
- MySQL 8+

## Configuracion
### Backend `.env`
1. Copia `backend/.env.example` como `backend/.env`
2. Ajusta credenciales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ames_events
DB_PORT=3306
PORT=3001
```

## Base de Datos
Ejecuta:
- `database/schema.sql`
- `database/seed.sql`

## Ejecucion
### Backend
```powershell
cd backend
npm install
node server.js
```

### Frontend
```powershell
cd frontend
npm install
npm start
```

## URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Endpoints Principales
### Events
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

### Categories
- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

### Locations
- `GET /locations`
- `GET /locations/:id`
- `POST /locations`
- `PUT /locations/:id`
- `DELETE /locations/:id`

### Audiences
- `GET /audiences`
- `GET /audiences/:id`
- `POST /audiences`
- `PUT /audiences/:id`
- `DELETE /audiences/:id`

### Organizers
- `GET /organizers`
- `GET /organizers/:id`
- `POST /organizers`
- `PUT /organizers/:id`
- `DELETE /organizers/:id`

### Auth
- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `POST /auth/login`
- `GET /auth/me`

El login devuelve un JWT y bloquea el acceso si la cuenta no esta verificada o si `is_active = 0`.

### Users Admin
Endpoints protegidos con JWT y rol `admin`.

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id/role`
- `PATCH /users/:id/status`

Los endpoints de lectura devuelven datos seguros del usuario:

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@tfg.local",
  "role": "admin",
  "is_active": true,
  "email_verified": true,
  "created_at": "2026-04-16T10:00:00.000Z"
}
```

`PATCH /users/:id/role` permite cambiar el rol a `admin`, `content_manager` o `user`.

```json
{
  "role": "content_manager"
}
```

La respuesta incluye el rol actualizado de forma explicita y el usuario recargado desde base de datos:

```json
{
  "message": "User role updated successfully",
  "role": "content_manager",
  "user": {
    "id": 2,
    "username": "gestor",
    "email": "gestor@example.com",
    "role": "content_manager",
    "is_active": true,
    "email_verified": true,
    "created_at": "2026-04-16T10:00:00.000Z"
  }
}
```

`PATCH /users/:id/status` activa o desactiva cuentas:

```json
{
  "is_active": false
}
```

Defensas implementadas:
- un admin no puede quitarse a si mismo el rol `admin`
- un admin no puede desactivar su propia cuenta
- no se asignan roles inexistentes
- no se devuelven `password_hash`, tokens de verificacion ni fechas de expiracion de token

### Perfil propio
Endpoints protegidos con JWT para el usuario autenticado.

- `GET /auth/me`
- `PATCH /users/me`
- `PATCH /users/me/password`

`PATCH /users/me` solo acepta el campo `username`:

```json
{
  "username": "nuevo_usuario"
}
```

No permite modificar email, rol, estado de verificacion ni `is_active`.

`PATCH /users/me/password` exige la contrasena actual y una nueva contrasena de al menos 8 caracteres:

```json
{
  "currentPassword": "contrasena_actual",
  "newPassword": "nueva_contrasena"
}
```

Nota de consistencia: la tabla `users` usa la columna `username` y la API/frontend mantienen ese mismo nombre para evitar confusiones entre capas. En la interfaz se muestra como "Nombre de usuario".

### Favorites
Endpoints protegidos con JWT y rol `user`.

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

Cuando se crea un evento nuevo, el backend evalua las alertas activas. Si una alerta coincide, envia un email al usuario siempre que la cuenta este activa y el email verificado. Si falla el envio de un correo, se registra el error y la creacion del evento no se cancela.

## Rutas Frontend
- `/map`: mapa de eventos
- `/events`: listado y gestion de eventos segun rol
- `/favorites`: favoritos del usuario registrado
- `/alerts`: alertas de eventos del usuario autenticado
- `/profile`: perfil propio del usuario autenticado
- `/admin/users`: gestion de usuarios para administradores

## Notas de Validacion (Events v4)
- `title`: obligatorio, maximo 150 caracteres.
- `category_id`, `location_id`: enteros positivos existentes.
- `audience_id`: opcional, pero debe existir si se informa.
- `organizer_id`: opcional, pero debe existir si se informa.
- `is_free`: obligatorio (`1/0` o booleano).
- Si `is_free = 0`, `price > 0`.
- `event_date`: opcional.
- `min_age` y `max_age`: opcionales, pero deben ir juntos si se informan.

## Build Frontend
```powershell
cd frontend
npm run build
```
