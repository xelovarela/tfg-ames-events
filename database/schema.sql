CREATE DATABASE IF NOT EXISTS ames_events;
USE ames_events;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL
);

CREATE TABLE audiences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_min INT NULL,
  age_max INT NULL
);

CREATE TABLE organizers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL
);

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
  CONSTRAINT fk_audience FOREIGN KEY (audience_id) REFERENCES audiences(id),
  CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(id),
  CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_location FOREIGN KEY (location_id) REFERENCES locations(id)
);
