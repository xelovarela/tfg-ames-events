-- ============================================================
-- AMES Events - Imagen opcional de eventos
-- ============================================================
-- Script de migracion para instalaciones antiguas.
-- Solo anade la columna image_url. Las imagenes por defecto se resuelven
-- desde la categoria en el frontend, asi evitamos datos de ejemplo duplicados.
-- ============================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL AFTER description;
