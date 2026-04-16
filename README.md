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
  "name": "admin",
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
    "name": "gestor",
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

### Favorites
Endpoints protegidos con JWT y rol `user`.

- `GET /favorites`
- `GET /favorites/ids`
- `POST /favorites/:eventId`
- `DELETE /favorites/:eventId`

## Rutas Frontend
- `/map`: mapa de eventos
- `/events`: listado y gestion de eventos segun rol
- `/favorites`: favoritos del usuario registrado
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
