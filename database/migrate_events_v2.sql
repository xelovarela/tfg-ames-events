USE ames_events;

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS event_date DATETIME NULL,
  ADD COLUMN IF NOT EXISTS is_free TINYINT(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS min_age INT NULL,
  ADD COLUMN IF NOT EXISTS max_age INT NULL;

UPDATE events
SET event_date = '2026-05-12 17:30:00', is_free = 0, price = 5.00, min_age = 5, max_age = 12
WHERE id = 3;

UPDATE events
SET event_date = '2026-05-15 18:30:00', is_free = 0, price = 4.00, min_age = 4, max_age = 10
WHERE id = 4;

UPDATE events
SET event_date = '2026-05-18 19:00:00', is_free = 0, price = 6.00, min_age = 4, max_age = 12
WHERE id = 5;

UPDATE events
SET event_date = NULL, is_free = 1, price = NULL, min_age = NULL, max_age = NULL
WHERE id IN (6, 7, 8, 10);
