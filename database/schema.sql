-- Este archivo define la estructura completa de la base de datos del proyecto.
-- Compatible con MySQL/MariaDB (incluyendo MariaDB 10.6).
CREATE DATABASE IF NOT EXISTS ames_events;
USE ames_events;

-- =========================
-- Seguridad: roles y users
-- =========================

-- Tabla de roles para control de permisos.
-- Se mantiene separada de users para cumplir 3FN y facilitar evolucion futura.
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidad con BD ya existentes: si roles venia de una version antigua,
-- se anaden las columnas nuevas sin necesidad de script de migracion separado.
SET @roles_add_description_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE roles ADD COLUMN description VARCHAR(255) NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'roles'
    AND COLUMN_NAME = 'description'
);
PREPARE roles_add_description_stmt FROM @roles_add_description_sql;
EXECUTE roles_add_description_stmt;
DEALLOCATE PREPARE roles_add_description_stmt;

SET @roles_add_created_at_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE roles ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'roles'
    AND COLUMN_NAME = 'created_at'
);
PREPARE roles_add_created_at_stmt FROM @roles_add_created_at_sql;
EXECUTE roles_add_created_at_stmt;
DEALLOCATE PREPARE roles_add_created_at_stmt;

-- Tabla de usuarios registrados.
-- BOOLEAN en MariaDB/MySQL es alias de TINYINT(1), por eso se usa sin perder compatibilidad.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification_token VARCHAR(255) NULL,
  verification_expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

-- Compatibilidad para bases ya existentes con estructura antigua de users.
SET @users_add_is_active_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_active'
);
PREPARE users_add_is_active_stmt FROM @users_add_is_active_sql;
EXECUTE users_add_is_active_stmt;
DEALLOCATE PREPARE users_add_is_active_stmt;

SET @users_add_email_verified_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified'
);
PREPARE users_add_email_verified_stmt FROM @users_add_email_verified_sql;
EXECUTE users_add_email_verified_stmt;
DEALLOCATE PREPARE users_add_email_verified_stmt;

SET @users_add_verification_token_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verification_token'
);
PREPARE users_add_verification_token_stmt FROM @users_add_verification_token_sql;
EXECUTE users_add_verification_token_stmt;
DEALLOCATE PREPARE users_add_verification_token_stmt;

SET @users_add_verification_expires_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE users ADD COLUMN verification_expires_at DATETIME NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'verification_expires_at'
);
PREPARE users_add_verification_expires_stmt FROM @users_add_verification_expires_sql;
EXECUTE users_add_verification_expires_stmt;
DEALLOCATE PREPARE users_add_verification_expires_stmt;

-- Roles iniciales del sistema.
-- ON DUPLICATE KEY evita errores si el esquema se ejecuta mas de una vez.
INSERT INTO roles (name, description)
VALUES
  ('admin', 'Acceso total al sistema'),
  ('content_manager', 'Gestion de contenidos y catalogos'),
  ('user', 'Usuario registrado con permisos basicos')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

-- Usuario administrador inicial.
-- Password original: admin123 (almacenada con hash bcrypt).
INSERT INTO users (
  username,
  email,
  password_hash,
  role_id,
  is_active,
  email_verified,
  email_verification_token,
  verification_expires_at
)
SELECT
  'admin',
  'admin@tfg.local',
  '$2b$10$6EBZa1q7fZUrXcGh7kfV8uMyl6ZWBNlgjzJt4QJGFwyW9ZfNJxGYq',
  r.id,
  TRUE,
  TRUE,
  NULL,
  NULL
FROM roles r
WHERE r.name = 'admin'
  AND NOT EXISTS (
    SELECT 1
    FROM users u
    WHERE u.email = 'admin@tfg.local'
  );

-- ======================
-- Catalogos de negocio
-- ======================

-- Tabla de categorias para clasificar cada evento por tipo.
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Tabla de ubicaciones con nombre y coordenadas geograficas.
CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL
);

-- Tabla de audiencias para describir rangos de edad o publico objetivo.
CREATE TABLE IF NOT EXISTS audiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_min INT NULL,
  age_max INT NULL
);

-- Tabla de organizadores con informacion basica de contacto.
CREATE TABLE IF NOT EXISTS organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL
);

-- Tabla principal de eventos con claves ajenas hacia los catalogos auxiliares.
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  event_date DATETIME NULL,
  is_free TINYINT(1) NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NULL,
  min_age INT NULL,
  max_age INT NULL,
  audience_id INT NULL,
  organizer_id INT NULL,
  category_id INT NOT NULL,
  location_id INT NOT NULL,
  -- Estas claves foraneas protegen la integridad entre eventos y sus catalogos.
  CONSTRAINT fk_audience FOREIGN KEY (audience_id) REFERENCES audiences(id),
  CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(id),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Tabla de favoritos: relacion N:M entre usuarios y eventos.
-- Usa INT porque users.id y events.id se declaran explicitamente como INT AUTO_INCREMENT.
CREATE TABLE IF NOT EXISTS favorites (
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_favorites_event
    FOREIGN KEY (event_id) REFERENCES events(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
