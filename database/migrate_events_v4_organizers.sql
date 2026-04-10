USE ames_events;

CREATE TABLE IF NOT EXISTS organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL
);

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS organizer_id INT NULL;

INSERT INTO organizers (name, email, phone)
SELECT * FROM (
  SELECT 'Concello de Ames' AS name, 'cultura@ames.gal' AS email, '+34 981 000 101' AS phone
  UNION ALL
  SELECT 'Biblioteca de Bertamirans', 'biblioteca@ames.gal', '+34 981 000 102'
  UNION ALL
  SELECT 'Asociacion Xogos en Familia', 'xogosfamilia@gmail.com', '+34 622 334 455'
  UNION ALL
  SELECT 'Club Deportivo Milladoiro', 'clubmilladoiro@example.org', '+34 981 000 103'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM organizers);

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'events'
    AND CONSTRAINT_NAME = 'fk_organizer'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE events ADD CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(id)',
  'SELECT 1'
);
PREPARE stmt FROM @fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
