# Frontend - Plataforma de Eventos en Ames

Aplicación React para consultar, filtrar y gestionar eventos municipales infantiles.

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env.local` en la raíz del frontend:

```
REACT_APP_API_BASE_URL=http://localhost:3001
PUBLIC_URL=/
```

Para producción:
```
REACT_APP_API_BASE_URL=https://api.anxovarela.es
PUBLIC_URL=/
```

## Scripts

```bash
npm start      # Desarrollo: http://localhost:3000
npm run build  # Crear build estático en carpeta build/
npm test       # Ejecutar tests
```

## Estructura

- `src/pages/` - Páginas de la aplicación
- `src/components/` - Componentes React reutilizables
- `src/hooks/` - Hooks personalizados (lógica)
- `src/utils/` - Utilidades (auth, API, validación)
- `src/styles/` - Estilos CSS
- `public/` - Assets estáticos (favicon, imágenes)

## Páginas principales

- `/` - Inicio
- `/map` - Mapa interactivo de eventos
- `/events` - Listado filtrable
- `/events/calendar` - Vista calendario
- `/events/:id` - Detalle de evento
- `/events/new` - Crear evento (admin/content_manager)
- `/events/:id/edit` - Editar evento (admin/content_manager)
- `/favorites` - Eventos marcados como favoritos (`user`, `admin` o `content_manager`)
- `/alerts` - Alertas personalizadas por categoria, localidad, audiencia o palabra clave (autenticado)
- `/profile` - Mi perfil (autenticado)
- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/verify-email` - Verificación de email
- `/forgot-password` - Solicitar reset de contraseña
- `/reset-password` - Restablecer contraseña
- `/admin/users` - Gestión de usuarios (admin)
- `/categories`, `/locations`, `/organizers` - Gestores de catálogos (admin/content_manager)


## Alertas

La pantalla `/alerts` permite crear criterios guardados para recibir avisos por email cuando se publiquen eventos que coincidan. El filtro geografico principal es la localidad, no la ubicacion exacta, para que una alerta pueda cubrir todos los espacios de `Bertamiráns`, `Milladoiro` u `Otras parroquias`.

## Listado de eventos

El listado `/events` usa los filtros compartidos de `useFilteredEvents` y pagina el
resultado en el cliente. `EventList` muestra 9 eventos por pagina, calcula el total
de paginas a partir del array recibido y vuelve a la primera pagina cuando cambia
el conjunto de eventos filtrados.

## Autenticación

El token JWT se guarda en `localStorage` y se envía en cada petición autenticada.
La sesión se sincroniza entre tabs automáticamente.

## Desarrollo

Para iniciar en modo desarrollo:
```bash
npm start
```

La aplicación estará en `http://localhost:3000`

## Build para producción

```bash
npm run build
```

Crea la carpeta `build/` con los archivos estáticos listos para servidor.

## Despliegue

1. Ejecutar: `npm run build`
2. Subir carpeta `build/` a servidor (cPanel, Vercel, Netlify, etc.)
3. Configurar web server para servir `build/index.html` en rutas 404
4. Asegurar que `REACT_APP_API_BASE_URL` apunta al backend correcto

### Configuración en cPanel

En `.htaccess` de la carpeta pública:
```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

## Testing

```bash
npm test
```

Se ejecutan tests con Jest y React Testing Library.
