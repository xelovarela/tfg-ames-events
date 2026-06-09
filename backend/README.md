# Backend - Plataforma de Eventos en Ames

API REST desarrollada con Node.js y Express para la gestion de eventos, usuarios, favoritos, alertas, catalogos y solicitudes de acceso como creador de contenido.

## Instalacion

```bash
npm install
```

Para una instalacion limpia completa, crea la base de datos, ejecuta `../database/schema.sql` y despues `../database/seed.sql`. El esquema completo actual esta en `schema.sql`; no hay migraciones adicionales que ejecutar.

## Variables de entorno

Copiar `.env.example` como `.env` en la raiz del backend y ajustar valores:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ames_events
DB_PORT=3306

JWT_SECRET=tu-secret-aqui-cambiar-en-produccion
APP_BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,https://ames-events.anxovarela.es

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@example.com
SMTP_PASS=tu-contrasena
MAIL_FROM="Ames Events <no-reply@ames-events.local>"

EVENT_IMAGES_DIR=/home/your-user/api/uploads/events
EVENT_IMAGES_PUBLIC_BASE_URL=https://api.anxovarela.es
CATEGORY_IMAGES_DIR=/home/your-user/api/uploads/categories
CATEGORY_IMAGES_PUBLIC_BASE_URL=https://api.anxovarela.es
```

Las variables de imagenes son opcionales. Si no se definen, los ficheros se guardan en `backend/uploads/events` y `backend/uploads/categories`.

## Scripts

```bash
npm start                         # Arrancar servidor
npm run send:favorite-reminders   # Ejecutar recordatorios manualmente
npm test                          # Ejecutar tests unitarios
```

Los recordatorios de favoritos no se ejecutan al arrancar el backend. Para enviarlos, ejecuta el script manualmente o prográmalo con cron.

## Estructura

- `server.js` - Punto de entrada y configuracion global de Express.
- `src/routes/` - Definicion de endpoints REST.
- `src/controllers/` - Validacion de entrada y respuestas HTTP.
- `src/services/` - Acceso a datos y consultas SQL.
- `src/middleware/` - Autenticacion, permisos y subida de imagenes.
- `src/config/` - Configuracion de base de datos y JWT.
- `src/utils/` - Utilidades puras de validacion y normalizacion.

## Endpoints principales

### Eventos

- `GET /events`
- `GET /events/:id`
- `POST /events` - `admin` o `content_manager`
- `PUT /events/:id` - `admin` o `content_manager`
- `DELETE /events/:id` - `admin`

### Autenticacion

- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/login`
- `GET /auth/me`

### Favoritos

- `GET /favorites`
- `GET /favorites/ids`
- `POST /favorites/:eventId`
- `DELETE /favorites/:eventId`

### Alertas

- `GET /alerts`
- `POST /alerts`
- `PUT /alerts/:id`
- `PATCH /alerts/:id/status`
- `DELETE /alerts/:id`

Las alertas usan `locality` para cubrir una zona completa (`Bertamirans`, `Milladoiro` u `Otras parroquias`) en lugar de limitarse a una ubicacion exacta. `location_id` se mantiene en la API y en la base de datos solo por compatibilidad con alertas antiguas.

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

### Usuarios

- `PATCH /users/me`
- `PATCH /users/me/password`
- `GET /users` - `admin`
- `GET /users/:id` - `admin`
- `PATCH /users/:id/role` - `admin`
- `PATCH /users/:id/status` - `admin`

### Solicitudes de creador de contenido

- `POST /content-manager-requests` - Crear solicitud (rol `user`)
- `GET /content-manager-requests/me` - Consultar solicitudes propias
- `GET /content-manager-requests?status=pending` - Listar solicitudes (admin)
- `PATCH /content-manager-requests/:id/review` - Aprobar o rechazar solicitud (admin)

Al crear una solicitud, el backend envia un aviso por email a los administradores con email disponible. Este aviso es informativo: si SMTP no esta configurado o el envio falla, la solicitud queda creada igualmente.

## Desarrollo

```bash
npm start
```

El servidor estara en `http://localhost:3001`.

## Despliegue en cPanel

1. Subir codigo al servidor mediante cPanel File Manager o Git.
2. Configurar variables en `.env`.
3. Ejecutar `npm install --production`.
4. Crear la aplicacion Node.js en cPanel usando el puerto configurado.
5. Configurar proxy/rewrite de Apache si el hosting lo requiere.

```apache
RewriteRule ^/(.*)$ http://127.0.0.1:3001/$1 [P,L]
```

## Testing

```bash
npm test
```

Ejecuta tests unitarios con `node:test` sobre autenticacion/permisos y validaciones de payloads de eventos y audiencias. No necesita servidor ni base de datos.
