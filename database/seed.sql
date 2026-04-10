USE ames_events;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE events;
TRUNCATE TABLE locations;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (name) VALUES
  ('Taller'),
  ('Cuentacuentos'),
  ('Deporte'),
  ('Musica'),
  ('Teatro'),
  ('Ciencia');

INSERT INTO locations (name, lat, lng) VALUES
  ('Casa da Cultura de Ames', 42.8569900, -8.6568200),
  ('Biblioteca Municipal de Bertamirans', 42.8618100, -8.6547800),
  ('Pabellon Municipal do Milladoiro', 42.8472500, -8.5898600),
  ('Parque da Peregrina', 42.8489900, -8.5909700),
  ('Auditorio Milladoiro', 42.8478100, -8.5931600),
  ('Centro Xuvenil de Bertamirans', 42.8598600, -8.6519800),
  ('Area Verde de Agro do Medio', 42.8508400, -8.5966200),
  ('CEIP A Maia', 42.8613900, -8.6525300);

INSERT INTO events (
  title,
  event_date,
  is_free,
  price,
  min_age,
  max_age,
  category_id,
  location_id
) VALUES
  ('Taller de pintura', '2026-05-12 17:30:00', 0, 5.00, 5, 12, 1, 1),
  ('Teatro Infantil', '2026-05-15 18:30:00', 0, 4.00, 4, 10, 5, 5),
  ('Musical', '2026-05-18 19:00:00', 0, 6.00, 4, 12, 4, 5),
  ('Show', NULL, 1, NULL, NULL, NULL, 2, 2),
  ('Circo', NULL, 1, NULL, NULL, NULL, 5, 3),
  ('Concierto', NULL, 1, NULL, NULL, NULL, 4, 5),
  ('Proba', NULL, 1, NULL, NULL, NULL, 6, 6),
  ('Taller de reciclaje creativo', '2026-06-03 17:00:00', 1, NULL, 6, 12, 1, 6),
  ('Lectura musicalizada', '2026-06-08 18:00:00', 1, NULL, 3, 8, 2, 2),
  ('Ciencia divertida con agua y color', '2026-06-15 17:30:00', 0, 3.50, 7, 12, 6, 1);
