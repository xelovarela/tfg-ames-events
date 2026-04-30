-- ============================================================
-- AMES Events - Imágenes de Categorías
-- ============================================================
-- Este script añade URLs de imágenes a la tabla de categorías.
-- Las imágenes se sirven desde la carpeta frontend/public/event-images/
-- 
-- Categorías con imágenes:
-- - Cultura: category-cultura.webp
-- - Deporte: category-deporte.webp
-- - Educación: category-educacion.webp
-- - Fiestas: category-fiestas.webp
-- - Gastronomía: category-gastronomia.webp
-- - Música: category-musica.webp
-- - Naturaleza: category-naturaleza.webp
-- - Ocio: category-ocio.webp
-- - Salud: category-salud.webp
-- ============================================================

-- Añadir columna image_url a la tabla categories si no existe
ALTER TABLE `categories`
  ADD COLUMN IF NOT EXISTS `image_url` VARCHAR(255) NULL AFTER `name`;

UPDATE `categories`
SET `image_url` = CASE
  WHEN `name` = 'Cultura' THEN '/event-images/category-cultura.webp'
  WHEN `name` = 'Deporte' THEN '/event-images/category-deporte.webp'
  WHEN `name` = 'Educación' THEN '/event-images/category-educacion.webp'
  WHEN `name` = 'Educacion' THEN '/event-images/category-educacion.webp'
  WHEN `name` = 'Fiestas' THEN '/event-images/category-fiestas.webp'
  WHEN `name` = 'Gastronomía' THEN '/event-images/category-gastronomia.webp'
  WHEN `name` = 'Gastronomia' THEN '/event-images/category-gastronomia.webp'
  WHEN `name` = 'Música' THEN '/event-images/category-musica.webp'
  WHEN `name` = 'Musica' THEN '/event-images/category-musica.webp'
  WHEN `name` = 'Naturaleza' THEN '/event-images/category-naturaleza.webp'
  WHEN `name` = 'Ocio' THEN '/event-images/category-ocio.webp'
  WHEN `name` = 'Salud' THEN '/event-images/category-salud.webp'
  ELSE `image_url`
END
WHERE `image_url` IS NULL OR `image_url` = '';
