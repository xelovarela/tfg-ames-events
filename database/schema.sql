-- Este archivo define la estructura completa de la base de datos del proyecto.
-- Crea la base principal y todas las tablas necesarias para almacenar eventos,
-- categorias, ubicaciones, audiencias y organizadores con sus relaciones.
-- Se asegura la existencia de la base de datos antes de usarla.
CREATE DATABASE IF NOT EXISTS ames_events;
USE ames_events;

-- Tabla de roles para el control basico de permisos (admin y user).
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios para autenticacion y autorizacion por rol.
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de categorias para clasificar cada evento por tipo.
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

-- Tabla de ubicaciones con nombre y coordenadas geograficas.
CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL
);

-- Tabla de audiencias para describir rangos de edad o publico objetivo.
CREATE TABLE audiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_min INT NULL,
  age_max INT NULL
);

-- Tabla de organizadores con informacion basica de contacto.
CREATE TABLE organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL
);

-- Tabla principal de eventos con claves ajenas hacia los catalogos auxiliares.
CREATE TABLE events (
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
