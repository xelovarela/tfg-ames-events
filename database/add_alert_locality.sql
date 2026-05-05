-- Añade filtro por localidad a las alertas de usuario.
-- Mantiene location_id para compatibilidad con alertas antiguas basadas en ubicacion exacta.
-- Es idempotente: puede ejecutarse de nuevo sin duplicar columna ni indice.

SET @column_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alerts'
    AND COLUMN_NAME = 'locality'
);

SET @add_column_sql := IF(
  @column_exists = 0,
  'ALTER TABLE alerts ADD COLUMN locality varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER location_id',
  'SELECT ''alerts.locality already exists'' AS info'
);

PREPARE add_column_stmt FROM @add_column_sql;
EXECUTE add_column_stmt;
DEALLOCATE PREPARE add_column_stmt;

SET @index_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alerts'
    AND INDEX_NAME = 'idx_alerts_locality'
);

SET @add_index_sql := IF(
  @index_exists = 0,
  'ALTER TABLE alerts ADD KEY idx_alerts_locality (locality)',
  'SELECT ''idx_alerts_locality already exists'' AS info'
);

PREPARE add_index_stmt FROM @add_index_sql;
EXECUTE add_index_stmt;
DEALLOCATE PREPARE add_index_stmt;

UPDATE alerts al
JOIN locations l ON l.id = al.location_id
SET al.locality = l.locality
WHERE al.locality IS NULL
  AND al.location_id IS NOT NULL;
