# Backend - Plataforma de Eventos en Ames

API REST desarrollada con Node.js + Express para la gestión de eventos municipales infantiles.

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env` en la raíz del backend:

```
PORT=3001
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ames_events
DB_PORT=3306

# Autenticación
JWT_SECRET=tu-secret-aqui-cambiar-en-producción

# Email (opcional, para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña
MAIL_FROM=noreply@ames-events.es
APP_BASE_URL=http://localhost:3000

# CORS
CORS_ORIGINS=http://localhost:3000,https://anxovarela.es

# Recordatorios de favoritos
FAVORITE_REMINDERS_ENABLED=true
FAVORITE_REMINDERS_RUN_TIME=09:00
```

## Scripts

```bash
npm start                          # Arrancar servidor (desarrollo)
npm run send:favorite-reminders   # Ejecutar recordatorios manualmente
npm test                          # Ejecutar tests
```

## Estructura

- `server.js` - Punto de entrada, configuración de Express
- `src/routes/` - Definición de endpoints REST
- `src/controllers/` - Lógica de peticiones HTTP
- `src/services/` - Acceso a datos y lógica de negocio
- `src/middleware/` - Autenticación, validación
- `src/config/` - Configuración (BD, JWT)
- `src/utils/` - Utilidades de validación, formateo
- `src/jobs/` - Tareas automáticas (recordatorios)

## Endpoints principales

### Eventos
- `GET /events` - Listar todos (público)
- `GET /events/:id` - Detalle de evento
- `POST /events` - Crear (admin/content_manager)
- `PUT /events/:id` - Editar (admin/content_manager)
- `DELETE /events/:id` - Eliminar (admin)

### Autenticación
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/verify-email?token=...` - Verificar email
- `POST /auth/forgot-password` - Solicitar reset
- `POST /auth/reset-password` - Restablecer contraseña
- `GET /auth/me` - Mi perfil (autenticado)

### Favoritos
- `GET /favorites` - Mis favoritos (`user`, `admin` o `content_manager`)
- `GET /favorites/ids` - Solo IDs de favoritos
- `POST /favorites/:eventId` - Añadir a favoritos (`user`, `admin` o `content_manager`)
- `DELETE /favorites/:eventId` - Eliminar de favoritos (`user`, `admin` o `content_manager`)

### Alertas
- `GET /alerts` - Mis alertas (autenticado)
- `POST /alerts` - Crear alerta por categoria, localidad, audiencia o palabra clave
- `PUT /alerts/:id` - Editar alerta
- `PATCH /alerts/:id/status` - Activar o desactivar alerta
- `DELETE /alerts/:id` - Eliminar alerta


Las alertas nuevas usan `locality` para cubrir una zona completa (`Bertamiráns`, `Milladoiro` u `Otras parroquias`) en lugar de limitarse a una ubicacion exacta. `location_id` se mantiene en la API y la base de datos solo por compatibilidad con alertas antiguas.

Si la base de datos ya existia antes de este cambio, aplicar:

```bash
mysql -u usuario -p nombre_base < ../database/add_alert_locality.sql
```

### Admin
- `GET /users` - Listar usuarios (admin)
- `GET /categories` - Categorías
- `POST /categories` - Crear categoría (admin/content_manager)
- `GET /locations` - Ubicaciones
- `POST /locations` - Crear ubicación (admin/content_manager)
- `GET /audiences` - Audiencias/rangos de edad
- `POST /audiences`, `PUT /audiences/:id`, `DELETE /audiences/:id` - Gestión de audiencias (admin)
- `GET /organizers` - Organizadores

## Despliegue en cPanel

1. Subir código a servidor via cPanel File Manager o Git
2. Configurar variables en `.env`
3. Ejecutar `npm install --production`
4. Usar cPanel "Node.js" app para crear aplicación en puerto 3001
5. Configurar reverse proxy en Apache

```
RewriteRule ^/(.*)$ http://127.0.0.1:3001/$1 [P,L]
```

## Desarrollo

Para iniciar en modo desarrollo:
```bash
npm start
```

El servidor estará en `http://localhost:3001`

## Testing

```bash
npm test
```
