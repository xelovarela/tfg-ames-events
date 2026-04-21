SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

START TRANSACTION;

-- Normaliza ubicaciones ya existentes y añade centros municipales, educativos,
-- deportivos y espacios abiertos habituales del Concello de Ames.
UPDATE locations
SET name = 'Casa da Cultura de Bertamiráns',
    lat = 42.8590000,
    lng = -8.6510000
WHERE id = 1;

UPDATE locations
SET name = 'Auditorio do Milladoiro',
    lat = 42.8478100,
    lng = -8.5931600
WHERE id = 2;

UPDATE locations
SET name = 'Parque do Ameneiro',
    lat = 42.8605640,
    lng = -8.6537430
WHERE id = 4;

INSERT INTO locations (name, lat, lng)
SELECT 'Biblioteca Municipal de Bertamiráns', 42.8618100, -8.6547800
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Biblioteca Municipal de Bertamiráns');

INSERT INTO locations (name, lat, lng)
SELECT 'Escola Infantil Municipal O Bosque', 42.8619000, -8.6553000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Escola Infantil Municipal O Bosque');

INSERT INTO locations (name, lat, lng)
SELECT 'Escola Infantil Municipal A Madalena', 42.8468000, -8.5905000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Escola Infantil Municipal A Madalena');

INSERT INTO locations (name, lat, lng)
SELECT 'CEIP A Maía', 42.8613900, -8.6525300
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'CEIP A Maía');

INSERT INTO locations (name, lat, lng)
SELECT 'CEIP Agro do Muíño', 42.8549000, -8.6389000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'CEIP Agro do Muíño');

INSERT INTO locations (name, lat, lng)
SELECT 'CEIP de Barouta', 42.9104801, -8.6552924
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'CEIP de Barouta');

INSERT INTO locations (name, lat, lng)
SELECT 'CEP de Ventín', 42.8529000, -8.6179000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'CEP de Ventín');

INSERT INTO locations (name, lat, lng)
SELECT 'Pavillón Municipal de Bertamiráns', 42.8668900, -8.6583300
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Pavillón Municipal de Bertamiráns');

INSERT INTO locations (name, lat, lng)
SELECT 'Pavillón Municipal do Milladoiro', 42.8472500, -8.5898600
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Pavillón Municipal do Milladoiro');

INSERT INTO locations (name, lat, lng)
SELECT 'Campo de fútbol municipal de Bertamiráns', 42.8667500, -8.6581500
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Campo de fútbol municipal de Bertamiráns');

INSERT INTO locations (name, lat, lng)
SELECT 'Campo de fútbol municipal do Milladoiro', 42.8439000, -8.5862000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Campo de fútbol municipal do Milladoiro');

INSERT INTO locations (name, lat, lng)
SELECT 'Paseo fluvial de Bertamiráns', 42.8612000, -8.6539000
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Paseo fluvial de Bertamiráns');

-- Amplía organizadores reales o plausibles para eventos municipales, escolares y deportivos.
UPDATE organizers
SET name = 'Concello de Ames',
    email = 'cultura@ames.gal',
    phone = '+34 981 000 101'
WHERE id = 1;

UPDATE organizers
SET name = 'Biblioteca de Bertamiráns',
    email = 'biblioteca@ames.gal',
    phone = '+34 981 000 102'
WHERE id = 2;

UPDATE organizers
SET name = 'Asociación Xogos en Familia',
    email = 'xogosfamilia@gmail.com',
    phone = '+34 622 334 455'
WHERE id = 3;

UPDATE organizers
SET name = 'Club Deportivo O Milladoiro',
    email = 'clubmilladoiro@example.org',
    phone = '+34 981 000 103'
WHERE id = 4;

INSERT INTO organizers (name, email, phone)
SELECT 'Concellaría de Deportes de Ames', NULL, '+34 981 883 002'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'Concellaría de Deportes de Ames');

INSERT INTO organizers (name, email, phone)
SELECT 'Concellaría de Educación de Ames', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'Concellaría de Educación de Ames');

INSERT INTO organizers (name, email, phone)
SELECT 'Escola Infantil Municipal O Bosque', 'eibertamirans@concellodeames.gal', '+34 682 497 369'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'Escola Infantil Municipal O Bosque');

INSERT INTO organizers (name, email, phone)
SELECT 'Escola Infantil Municipal A Madalena', 'eiomilladoiro@concellodeames.gal', '+34 981 538 433'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'Escola Infantil Municipal A Madalena');

INSERT INTO organizers (name, email, phone)
SELECT 'CEIP A Maía', 'ceip.a.maia@edu.xunta.gal', '+34 881 866 002'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'CEIP A Maía');

INSERT INTO organizers (name, email, phone)
SELECT 'CEIP Agro do Muíño', 'ceip.agromuino@edu.xunta.es', '+34 881 866 010'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'CEIP Agro do Muíño');

INSERT INTO organizers (name, email, phone)
SELECT 'CEIP de Barouta', NULL, '+34 881 867 455'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'CEIP de Barouta');

INSERT INTO organizers (name, email, phone)
SELECT 'ANPA As Brañas de Ventín', NULL, '+34 627 537 271'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'ANPA As Brañas de Ventín');

INSERT INTO organizers (name, email, phone)
SELECT 'Bertamiráns FC', 'bertamiransfc@gmail.com', '+34 881 087 583'
WHERE NOT EXISTS (SELECT 1 FROM organizers WHERE name = 'Bertamiráns FC');

-- Corrige eventos existentes para que todos tengan ubicación, organizador,
-- descripción, fecha y datos de público.
UPDATE events
SET title = 'Taller de pintura infantil',
    category_id = (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Casa da Cultura de Bertamiráns' LIMIT 1),
    description = 'Taller creativo de pintura para niños y niñas con materiales adaptados por edades.',
    event_date = '2026-05-12 17:30:00',
    price = 5.00,
    is_free = 0,
    min_age = 5,
    max_age = 12,
    audience_id = (SELECT id FROM audiences WHERE name = 'Infantil' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Concello de Ames' LIMIT 1)
WHERE id = 3;

UPDATE events
SET title = 'Teatro infantil no Milladoiro',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Auditorio do Milladoiro' LIMIT 1),
    description = 'Obra de teatro infantil con música, humor y participación del público familiar.',
    event_date = '2026-05-15 18:30:00',
    price = 4.00,
    is_free = 0,
    min_age = 4,
    max_age = 10,
    audience_id = (SELECT id FROM audiences WHERE name = 'Infantil' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Concello de Ames' LIMIT 1)
WHERE id = 4;

UPDATE events
SET title = 'Musical familiar',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Auditorio do Milladoiro' LIMIT 1),
    description = 'Espectáculo musical familiar con canciones en directo y pequeñas coreografías participativas.',
    event_date = '2026-05-18 19:00:00',
    price = 6.00,
    is_free = 0,
    min_age = 4,
    max_age = 12,
    audience_id = (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Concello de Ames' LIMIT 1)
WHERE id = 5;

UPDATE events
SET title = 'Show de maxia en familia',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Biblioteca Municipal de Bertamiráns' LIMIT 1),
    description = 'Sesión de magia cercana para público familiar, con números visuales y participación de niños y niñas.',
    event_date = '2026-05-23 12:00:00',
    price = NULL,
    is_free = 1,
    min_age = 4,
    max_age = NULL,
    audience_id = (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Biblioteca de Bertamiráns' LIMIT 1)
WHERE id = 6;

UPDATE events
SET title = 'Circo de rúa no Parque do Ameneiro',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Parque do Ameneiro' LIMIT 1),
    description = 'Actuación de circo al aire libre con malabares, equilibrio y clown para todos los públicos.',
    event_date = '2026-05-30 18:00:00',
    price = NULL,
    is_free = 1,
    min_age = NULL,
    max_age = NULL,
    audience_id = (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Asociación Xogos en Familia' LIMIT 1)
WHERE id = 7;

UPDATE events
SET title = 'Concerto escolar de primavera',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Casa da Cultura de Bertamiráns' LIMIT 1),
    description = 'Concierto de primavera con repertorio infantil y piezas preparadas por alumnado de Ames.',
    event_date = '2026-06-05 19:00:00',
    price = NULL,
    is_free = 1,
    min_age = NULL,
    max_age = NULL,
    audience_id = (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Concellaría de Educación de Ames' LIMIT 1)
WHERE id = 8;

UPDATE events
SET title = 'Xornada de xogos tradicionais',
    category_id = (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Campo de fútbol municipal de Bertamiráns' LIMIT 1),
    description = 'Jornada lúdica con juegos tradicionales gallegos, relevos y dinámicas cooperativas para familias.',
    event_date = '2026-06-12 17:00:00',
    price = NULL,
    is_free = 1,
    min_age = 6,
    max_age = 12,
    audience_id = (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Concellaría de Deportes de Ames' LIMIT 1)
WHERE id = 10;

UPDATE events
SET title = 'Contacontos para primeira infancia',
    category_id = (SELECT id FROM categories WHERE name = 'Cultura' LIMIT 1),
    location_id = (SELECT id FROM locations WHERE name = 'Escola Infantil Municipal A Madalena' LIMIT 1),
    description = 'Sesión breve de cuentos, canciones y juego simbólico para bebés y niñas y niños de hasta 3 años.',
    event_date = '2026-06-18 17:30:00',
    price = NULL,
    is_free = 1,
    min_age = 0,
    max_age = 3,
    audience_id = (SELECT id FROM audiences WHERE name = 'Primera infancia' LIMIT 1),
    organizer_id = (SELECT id FROM organizers WHERE name = 'Escola Infantil Municipal A Madalena' LIMIT 1)
WHERE id = 15;

-- Nuevos eventos repartidos por escuelas, pabellones, campos y espacios abiertos.
INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Roteiro maker no CEIP de Barouta',
       (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'CEIP de Barouta' LIMIT 1),
       'Obradoiro itinerante de ciencia y tecnología con pequeños retos de construcción, creatividad y pensamiento lógico.',
       '2026-06-20 10:30:00', NULL, 1, 7, 12,
       (SELECT id FROM audiences WHERE name = 'Preadolescente' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'CEIP de Barouta' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Roteiro maker no CEIP de Barouta');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Ciencia divertida no CEIP A Maía',
       (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'CEIP A Maía' LIMIT 1),
       'Experimentos sencillos con agua, color y luz para descubrir fenómenos básicos de ciencia de forma segura.',
       '2026-06-22 11:00:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Preadolescente' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'CEIP A Maía' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Ciencia divertida no CEIP A Maía');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Horta escolar aberta no CEIP Agro do Muíño',
       (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'CEIP Agro do Muíño' LIMIT 1),
       'Actividad de huerto escolar con siembra, compostaje y cuidados básicos de plantas para alumnado y familias.',
       '2026-06-24 16:30:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'CEIP Agro do Muíño' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Horta escolar aberta no CEIP Agro do Muíño');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Tarde de convivencia no CEP de Ventín',
       (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'CEP de Ventín' LIMIT 1),
       'Encuentro de convivencia con juegos cooperativos, lectura compartida y merienda saludable.',
       '2026-06-26 17:00:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'ANPA As Brañas de Ventín' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tarde de convivencia no CEP de Ventín');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Psicomotricidade en familia en O Bosque',
       (SELECT id FROM categories WHERE name = 'Educación' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Escola Infantil Municipal O Bosque' LIMIT 1),
       'Sesión de movimiento, equilibrio y juego libre acompañada para primera infancia y familias.',
       '2026-06-28 11:00:00', NULL, 1, 0, 3,
       (SELECT id FROM audiences WHERE name = 'Primera infancia' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Escola Infantil Municipal O Bosque' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Psicomotricidade en familia en O Bosque');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Escolas deportivas no Pavillón de Bertamiráns',
       (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Pavillón Municipal de Bertamiráns' LIMIT 1),
       'Jornada de puertas abiertas de las escuelas deportivas municipales con baloncesto, voleibol y juegos de equipo.',
       '2026-07-02 18:00:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Concellaría de Deportes de Ames' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Escolas deportivas no Pavillón de Bertamiráns');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Multideporte no Pavillón do Milladoiro',
       (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Pavillón Municipal do Milladoiro' LIMIT 1),
       'Circuito multideporte con fútbol sala, balonmano y juegos de coordinación para niños y niñas.',
       '2026-07-04 18:00:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Concellaría de Deportes de Ames' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Multideporte no Pavillón do Milladoiro');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Torneo de fútbol base en Bertamiráns',
       (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Campo de fútbol municipal de Bertamiráns' LIMIT 1),
       'Encuentro de fútbol base con partidos amistosos por categorías y actividades de convivencia deportiva.',
       '2026-07-11 10:00:00', NULL, 1, 7, 12,
       (SELECT id FROM audiences WHERE name = 'Preadolescente' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Bertamiráns FC' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Torneo de fútbol base en Bertamiráns');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Encontro deportivo do Milladoiro',
       (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Campo de fútbol municipal do Milladoiro' LIMIT 1),
       'Encuentro deportivo con juegos de balón, relevos y dinámicas de cooperación para familias del Milladoiro.',
       '2026-07-18 10:30:00', NULL, 1, 6, 12,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Club Deportivo O Milladoiro' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Encontro deportivo do Milladoiro');

INSERT INTO events (title, category_id, location_id, description, event_date, price, is_free, min_age, max_age, audience_id, organizer_id)
SELECT 'Carreira de orientación no paseo fluvial',
       (SELECT id FROM categories WHERE name = 'Deporte' LIMIT 1),
       (SELECT id FROM locations WHERE name = 'Paseo fluvial de Bertamiráns' LIMIT 1),
       'Prueba de orientación familiar por equipos en el entorno del paseo fluvial de Bertamiráns.',
       '2026-07-25 11:00:00', NULL, 1, 8, NULL,
       (SELECT id FROM audiences WHERE name = 'Familiar' LIMIT 1),
       (SELECT id FROM organizers WHERE name = 'Concellaría de Deportes de Ames' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Carreira de orientación no paseo fluvial');

COMMIT;
