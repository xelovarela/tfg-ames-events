# Frontend - Plataforma de Eventos en Ames

Aplicacion React para consultar, filtrar y gestionar eventos infantiles y familiares.

## Instalacion

```bash
npm install
```

## Variables de entorno

Copiar `.env.example` como `.env` en la raiz del frontend:

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

Para produccion:

```env
REACT_APP_API_BASE_URL=https://api.anxovarela.es
```

## Scripts

```bash
npm start      # Desarrollo: http://localhost:3000
npm run build  # Crear build estatico en carpeta build/
npm test       # Ejecutar tests con salida detallada
```

## Estructura

- `src/pages/` - Paginas de la aplicacion.
- `src/` - Componentes React reutilizables de agenda, mapa, formularios y layout.
- `src/hooks/` - Hooks personalizados.
- `src/utils/` - Utilidades de auth, API, filtros y validacion.
- `src/styles/` - Estilos globales.
- `public/` - Assets estaticos e imagenes fallback.

## Paginas principales

- `/` - Inicio.
- `/map` - Mapa interactivo de eventos.
- `/events` - Listado filtrable.
- `/events/calendar` - Vista calendario.
- `/events/:id` - Detalle de evento.
- `/events/new` - Crear evento (admin/content_manager).
- `/events/:id/edit` - Editar evento (admin/content_manager).
- `/favorites` - Eventos marcados como favoritos (`user`, `admin` o `content_manager`).
- `/alerts` - Alertas personalizadas por categoria, localidad, audiencia o palabra clave.
- `/profile` - Mi perfil.
- `/propose-event` - Solicitud de acceso como creador de contenido; al enviarla, el backend avisa por email a los administradores.
- `/login` - Inicio de sesion.
- `/register` - Registro de usuario.
- `/verify-email` - Verificacion de email.
- `/forgot-password` - Solicitar reset de contrasena.
- `/reset-password` - Restablecer contrasena.
- `/admin/users` - Gestion de usuarios y solicitudes de acceso (admin).
- `/categories`, `/locations`, `/organizers` - Gestores de catalogos (admin/content_manager).
- `/audiences` - Gestor de audiencias (admin).
- `/acerca-de`, `/contacto`, `/aviso-legal`, `/privacidad`, `/accesibilidad`, `/ayuda`, `/mapa-del-sitio` - Paginas informativas y legales.

## Alertas

La pantalla `/alerts` permite crear criterios guardados para recibir avisos por email cuando se publiquen eventos que coincidan. El filtro geografico principal es la localidad, no la ubicacion exacta, para que una alerta pueda cubrir todos los espacios de `Bertamirans`, `Milladoiro` u `Otras parroquias`.

## Listado de eventos

El listado `/events` usa los filtros compartidos de `useFilteredEvents` y pagina el resultado en el cliente. `EventList` muestra 9 eventos por pagina, calcula el total de paginas a partir del array recibido y vuelve a la primera pagina cuando cambia el conjunto de eventos filtrados.

## Autenticacion

El token JWT se guarda en `localStorage` y se envia en cada peticion autenticada. La sesion se sincroniza entre tabs automaticamente.

## Desarrollo

```bash
npm start
```

La aplicacion estara en `http://localhost:3000`.

## Build para produccion

```bash
npm run build
```

Crea la carpeta `build/` con los archivos estaticos listos para servidor.

## Despliegue

1. Ejecutar `npm run build`.
2. Subir carpeta `build/` a servidor (cPanel, Vercel, Netlify, etc.).
3. Configurar el servidor para servir `build/index.html` en rutas 404.
4. Asegurar que `REACT_APP_API_BASE_URL` apunta al backend correcto.

### Configuracion en cPanel

En `.htaccess` de la carpeta publica:

```apache
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

Se ejecutan tests con Jest y React Testing Library en modo detallado. La suite cubre validaciones de formularios, filtros, favoritos, imagenes, helpers HTTP, ordenacion de audiencias y renderizado basico de la home.
