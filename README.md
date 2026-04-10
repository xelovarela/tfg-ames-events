# Ames Events - TFG

Aplicacion web para gestionar y visualizar eventos infantiles geolocalizados en Ames.

## Stack
- Frontend: React + Leaflet
- Backend: Node.js + Express (REST API)
- Base de datos: MySQL

## Estado Actual
- Mapa interactivo con Leaflet y agrupacion de eventos por ubicacion.
- CRUD de eventos.
- CRUD completo de categorias.
- CRUD completo de ubicaciones.
- Validaciones backend y frontend para datos clave.
- Modelo `events` actualizado a v2 con:
  - `event_date`
  - `is_free`
  - `price`
  - `min_age`
  - `max_age`

## Estructura
- `frontend/`: SPA React
- `backend/`: API Express
- `database/`: schema, seed y migraciones SQL

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
### Opcion A: instalacion limpia
Ejecuta:
- `database/schema.sql`
- `database/seed.sql`

### Opcion B: base ya existente (migrar `events` a v2)
Ejecuta:
- `database/migrate_events_v2.sql`

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

## Notas de Validacion (Events v2)
- `title`: obligatorio, maximo 150 caracteres.
- `category_id`, `location_id`: enteros positivos existentes.
- `is_free`: obligatorio (`1/0` o booleano).
- Si `is_free = 0`, `price > 0`.
- `event_date`: opcional.
- `min_age` y `max_age`: opcionales, pero deben ir juntos si se informan.

## Build Frontend
```powershell
cd frontend
npm run build
```
