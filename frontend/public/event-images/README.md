# Imágenes de demostración por categoría

Estas imágenes se usan como contenido visual de demostración cuando un evento no tiene una imagen subida por el usuario.

## Criterio de selección

La aplicación sigue este orden:

1. Imagen subida o asignada al evento (`image_url`).
2. Imagen de demostración asociada a la categoría del evento.
3. Imagen genérica final (`default-event.svg`) si la categoría no tiene fallback configurado.

La lógica está centralizada en `frontend/src/utils/eventImages.js`.

## Imágenes actuales por categoría

- Cultura: `category-cultura.webp`
- Deporte: `category-deporte.webp`
- Educación: `category-educacion.webp`
- Fiestas: `category-fiestas.webp`
- Gastronomía: `category-gastronomia.webp`
- Música: `category-musica.webp`
- Naturaleza: `category-naturaleza.webp`
- Ocio: `category-ocio.webp`
- Salud: `category-salud.webp`
- Fallback genérico final: `default-event.svg`

Las imágenes antiguas genéricas se han retirado porque el sistema actual usa imágenes específicas por categoría. Esto evita duplicidad de recursos y hace más clara la gestión de assets visuales.

## Recomendaciones para nuevas imágenes

- Formato recomendado: `.webp` para reducir peso.
- Relación recomendada: 16:9.
- Tamaño recomendado para imágenes de demostración: 900x506 px.
- Tamaño recomendado para imágenes subidas por usuarios: el backend las optimiza a 900x506 px en formato `.webp`.
- Evitar texto dentro de la imagen.
- Evitar logos, marcas de agua o elementos con derechos dudosos.
- Mantener un estilo visual coherente, cálido, familiar e infantil.
- Usar imágenes que funcionen bien con `object-fit: cover` en cards y detalle.

## Cómo añadir una nueva categoría

1. Añadir la imagen a esta carpeta.
2. Usar un nombre estable y descriptivo, por ejemplo `category-teatro.webp`.
3. Actualizar el mapa `CATEGORY_FALLBACK_IMAGES` en `frontend/src/utils/eventImages.js`.
4. Añadir o actualizar tests en `frontend/src/utils/eventImages.test.js`.
5. Comprobar listado, detalle, favoritos y portada.
