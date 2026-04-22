-- Migration para instalaciones existentes: permite asociar una imagen opcional a cada evento.
-- En MariaDB 10.6 se puede ejecutar varias veces gracias a IF NOT EXISTS.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) NULL AFTER description;

-- Imagenes de demostracion servidas desde frontend/public/event-images.
-- Solo rellena eventos que todavia no tengan imagen asociada.
UPDATE events e
JOIN categories c ON c.id = e.category_id
SET e.image_url = CASE
  WHEN LOWER(c.name) LIKE '%deport%' OR LOWER(e.title) LIKE '%fútbol%' OR LOWER(e.title) LIKE '%futbol%' THEN '/event-images/demo-sports.jpg'
  WHEN LOWER(c.name) LIKE '%educ%' OR LOWER(e.title) LIKE '%biblioteca%' OR LOWER(e.title) LIKE '%lectura%' THEN '/event-images/demo-library.jpg'
  WHEN LOWER(e.title) LIKE '%parque%' OR LOWER(e.title) LIKE '%familia%' THEN '/event-images/demo-park.jpg'
  ELSE '/event-images/demo-culture.jpg'
END
WHERE e.image_url IS NULL;
