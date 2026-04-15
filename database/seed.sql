-- Este archivo inserta datos de ejemplo para poder probar la aplicacion.
-- Limpia las tablas en un orden seguro y despues vuelve a poblar los catalogos
-- y varios eventos de demostracion relacionados entre si.
-- Se selecciona la base de datos sobre la que se van a cargar los datos iniciales.
USE ames_events;

-- Se desactivan temporalmente las claves foraneas para vaciar las tablas sin errores.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE events;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE organizers;
TRUNCATE TABLE audiences;
TRUNCATE TABLE locations;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- Roles base para el sistema de autorizacion.
INSERT INTO roles (name) VALUES
  ('admin'),
  ('user');

-- Usuario administrador inicial para acceso al panel de gestion.
INSERT INTO users (username, email, password_hash, role_id) VALUES
  ('admin', 'admin@ames.local', '$2b$10$h7aDuOYJEaUiG8u2KUj9qOr2DKf7f4QbovqhY2xK4FcdGFV3OJat2', 1);

-- Catalogo base de categorias disponibles en la aplicacion.
INSERT INTO categories (name) VALUES
  ('Taller'),
  ('Cuentacuentos'),
  ('Deporte'),
  ('Musica'),
  ('Teatro'),
  ('Ciencia');

-- Conjunto inicial de ubicaciones reales o de ejemplo dentro de Ames.
INSERT INTO locations (name, lat, lng) VALUES
  ('Casa da Cultura de Ames', 42.8569900, -8.6568200),
  ('Biblioteca Municipal de Bertamirans', 42.8618100, -8.6547800),
  ('Pabellon Municipal do Milladoiro', 42.8472500, -8.5898600),
  ('Parque da Peregrina', 42.8489900, -8.5909700),
  ('Auditorio Milladoiro', 42.8478100, -8.5931600),
  ('Centro Xuvenil de Bertamirans', 42.8598600, -8.6519800),
  ('Area Verde de Agro do Medio', 42.8508400, -8.5966200),
  ('CEIP A Maia', 42.8613900, -8.6525300);

-- Audiencias con sus rangos de edad orientativos.
INSERT INTO audiences (name, age_min, age_max) VALUES
  ('Primera infancia', 0, 3),
  ('Infantil', 4, 6),
  ('Primaria', 7, 12),
  ('Familiar', NULL, NULL);

-- Organizadores de ejemplo para vincularlos a los eventos.
INSERT INTO organizers (name, email, phone) VALUES
  ('Concello de Ames', 'cultura@ames.gal', '+34 981 000 101'),
  ('Biblioteca de Bertamirans', 'biblioteca@ames.gal', '+34 981 000 102'),
  ('Asociacion Xogos en Familia', 'xogosfamilia@gmail.com', '+34 622 334 455'),
  ('Club Deportivo Milladoiro', 'clubmilladoiro@example.org', '+34 981 000 103');

-- Eventos de demostracion que ejercitan distintos casos de uso del sistema.
INSERT INTO events (
  title,
  description,
  event_date,
  is_free,
  price,
  min_age,
  max_age,
  audience_id,
  organizer_id,
  category_id,
  location_id
) VALUES
  ('Taller de pintura', 'Sesion creativa con materiales adaptados para ninos y ninas.', '2026-05-12 17:30:00', 0, 5.00, 5, 12, 3, 1, 1, 1),
  ('Teatro Infantil', 'Espectaculo teatral participativo con personajes clasicos.', '2026-05-15 18:30:00', 0, 4.00, 4, 10, 2, 1, 5, 5),
  ('Musical', 'Representacion musical familiar con canciones en directo.', '2026-05-18 19:00:00', 0, 6.00, 4, 12, 3, 2, 4, 5),
  ('Show', NULL, NULL, 1, NULL, NULL, NULL, 4, NULL, 2, 2),
  ('Circo', NULL, NULL, 1, NULL, NULL, NULL, 4, 3, 5, 3),
  ('Concierto', NULL, NULL, 1, NULL, NULL, NULL, 4, 2, 4, 5),
  ('Proba', 'Evento de prueba para validaciones internas.', NULL, 1, NULL, NULL, NULL, 4, NULL, 6, 6),
  ('Taller de reciclaje creativo', 'Actividad para aprender a reutilizar materiales del hogar.', '2026-06-03 17:00:00', 1, NULL, 6, 12, 3, 3, 1, 6),
  ('Lectura musicalizada', 'Cuentos narrados con acompanamiento de instrumentos suaves.', '2026-06-08 18:00:00', 1, NULL, 3, 8, 2, 2, 2, 2),
  ('Ciencia divertida con agua y color', 'Experimentos seguros para descubrir fenomenos basicos de ciencia.', '2026-06-15 17:30:00', 0, 3.50, 7, 12, 3, 1, 6, 1);
