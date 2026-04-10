USE ames_events;

CREATE TABLE IF NOT EXISTS audiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_min INT NULL,
  age_max INT NULL
);

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS audience_id INT NULL;

INSERT INTO audiences (name, age_min, age_max)
SELECT * FROM (
  SELECT 'Primera infancia' AS name, 0 AS age_min, 3 AS age_max
  UNION ALL
  SELECT 'Infantil', 4, 6
  UNION ALL
  SELECT 'Primaria', 7, 12
  UNION ALL
  SELECT 'Familiar', NULL, NULL
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM audiences);

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'events'
    AND CONSTRAINT_NAME = 'fk_audience'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE events ADD CONSTRAINT fk_audience FOREIGN KEY (audience_id) REFERENCES audiences(id)',
  'SELECT 1'
);
PREPARE stmt FROM @fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE events
SET audience_id = CASE
  WHEN min_age IS NULL AND max_age IS NULL THEN 4
  WHEN max_age <= 3 THEN 1
  WHEN min_age >= 4 AND max_age <= 6 THEN 2
  ELSE 3
END
WHERE audience_id IS NULL;
