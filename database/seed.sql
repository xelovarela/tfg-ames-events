
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
INSERT INTO `alerts` (`id`, `user_id`, `name`, `category_id`, `location_id`, `audience_id`, `min_age`, `max_age`, `keyword`, `is_active`, `created_at`, `updated_at`) VALUES (1,4,'Solo cultura',1,NULL,NULL,NULL,NULL,NULL,1,'2026-04-17 11:27:26','2026-04-17 11:27:26');
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `audiences` WRITE;
/*!40000 ALTER TABLE `audiences` DISABLE KEYS */;
INSERT INTO `audiences` (`id`, `name`, `age_min`, `age_max`) VALUES (1,'Primera infancia',0,5),(2,'Infantil',6,9),(3,'Preadolescente',10,12),(4,'Familiar',NULL,NULL),(5,'Adultos',18,NULL);
/*!40000 ALTER TABLE `audiences` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`) VALUES (1,'Cultura'),(2,'Deporte'),(3,'Educación'),(5,'Música');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` (`id`, `title`, `category_id`, `location_id`, `description`, `event_date`, `price`, `is_free`, `min_age`, `max_age`, `image_url`, `created_at`, `updated_at`, `audience_id`, `organizer_id`) VALUES (3,'Taller de pintura infantil',3,1,'Taller creativo de pintura para niños y niñas con materiales adaptados por edades.','2026-04-22 17:30:00',5.00,0,5,12,'/event-images/demo-library.jpg','2026-04-10 16:42:21','2026-04-21 17:18:35',2,1),(4,'Teatro infantil no Milladoiro',1,2,'Obra de teatro infantil con música, humor y participación del público familiar.','2026-05-15 18:30:00',4.00,0,4,10,'/uploads/events/event-1777046369174-460910186.jpg','2026-04-10 16:42:21','2026-04-24 15:59:29',2,1),(5,'Musical familiar',5,2,'Espectáculo musical familiar con canciones en directo y pequeñas coreografías participativas.','2026-05-18 19:00:00',6.00,0,4,12,'/event-images/demo-park.jpg','2026-04-10 16:42:21','2026-04-24 15:18:38',4,1),(6,'Show de maxia en familia',1,5,'Sesión de magia cercana para público familiar, con números visuales y participación de niños y niñas.','2026-05-23 12:00:00',NULL,1,4,NULL,'/event-images/demo-park.jpg','2026-04-10 16:42:21','2026-04-21 17:18:35',4,2),(7,'Circo de rúa no Parque do Ameneiro',1,4,'Actuación de circo al aire libre con malabares, equilibrio y clown para todos los públicos.','2026-05-30 18:00:00',NULL,1,NULL,NULL,'/event-images/demo-park.jpg','2026-04-10 16:42:21','2026-04-21 17:18:35',4,3),(8,'Concerto escolar de primavera',5,1,'Concierto de primavera con repertorio infantil y piezas preparadas por alumnado de Ames.','2026-06-05 19:00:00',NULL,1,NULL,NULL,'/event-images/demo-culture.jpg','2026-04-10 16:42:21','2026-04-24 15:18:59',4,6),(10,'Xornada de xogos tradicionais',2,14,'Jornada lúdica con juegos tradicionales gallegos, relevos y dinámicas cooperativas para familias.','2026-06-12 17:00:00',NULL,1,6,12,'/event-images/demo-sports.jpg','2026-04-10 16:42:21','2026-04-21 17:18:35',4,5),(15,'Contacontos para primeira infancia',1,7,'Sesión breve de cuentos, canciones y juego simbólico para bebés y niñas y niños de hasta 3 años.','2026-06-18 17:30:00',NULL,1,0,3,'/event-images/demo-culture.jpg','2026-04-13 10:07:09','2026-04-21 17:18:35',1,8),(16,'Roteiro maker no CEIP de Barouta',3,10,'Obradoiro itinerante de ciencia y tecnología con pequeños retos de construcción, creatividad y pensamiento lógico.','2026-06-20 10:30:00',NULL,1,7,12,'/event-images/demo-library.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',3,11),(17,'Ciencia divertida no CEIP A Maía',3,8,'Experimentos sencillos con agua, color y luz para descubrir fenómenos básicos de ciencia de forma segura.','2026-06-22 11:00:00',NULL,1,6,12,'/event-images/demo-library.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',3,9),(18,'Horta escolar aberta no CEIP Agro do Muíño',3,9,'Actividad de huerto escolar con siembra, compostaje y cuidados básicos de plantas para alumnado y familias.','2026-06-24 16:30:00',NULL,1,6,12,'/event-images/demo-library.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,10),(19,'Tarde de convivencia no CEP de Ventín',3,11,'Encuentro de convivencia con juegos cooperativos, lectura compartida y merienda saludable.','2026-06-26 17:00:00',NULL,1,6,12,'/event-images/demo-library.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,12),(20,'Psicomotricidade en familia en O Bosque',3,6,'Sesión de movimiento, equilibrio y juego libre acompañada para primera infancia y familias.','2026-06-28 11:00:00',NULL,1,0,3,'/event-images/demo-library.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',1,7),(21,'Escolas deportivas no Pavillón de Bertamiráns',2,12,'Jornada de puertas abiertas de las escuelas deportivas municipales con baloncesto, voleibol y juegos de equipo.','2026-07-02 18:00:00',NULL,1,6,12,'/event-images/demo-sports.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,5),(22,'Multideporte no Pavillón do Milladoiro',2,13,'Circuito multideporte con fútbol sala, balonmano y juegos de coordinación para niños y niñas.','2026-07-04 18:00:00',NULL,1,6,12,'/event-images/demo-sports.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,5),(23,'Torneo de fútbol base en Bertamiráns',2,14,'Encuentro de fútbol base con partidos amistosos por categorías y actividades de convivencia deportiva.','2026-07-11 10:00:00',NULL,1,7,12,'/event-images/demo-sports.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',3,13),(24,'Encontro deportivo do Milladoiro',2,15,'Encuentro deportivo con juegos de balón, relevos y dinámicas de cooperación para familias del Milladoiro.','2026-07-18 10:30:00',NULL,1,6,12,'/event-images/demo-sports.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,4),(25,'Carreira de orientación no paseo fluvial',2,16,'Prueba de orientación familiar por equipos en el entorno del paseo fluvial de Bertamiráns.','2026-07-25 11:00:00',NULL,1,8,NULL,'/event-images/demo-sports.jpg','2026-04-21 09:20:01','2026-04-21 17:18:35',4,5);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `favorite_event_reminders` WRITE;
/*!40000 ALTER TABLE `favorite_event_reminders` DISABLE KEYS */;
INSERT INTO `favorite_event_reminders` (`user_id`, `event_id`, `reminder_for`, `sent_at`) VALUES (2,3,'2026-04-22','2026-04-21 10:38:08'),(7,3,'2026-04-22','2026-04-21 10:38:11');
/*!40000 ALTER TABLE `favorite_event_reminders` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` (`user_id`, `event_id`, `created_at`) VALUES (2,3,'2026-04-24 14:04:07'),(2,5,'2026-04-21 14:50:58'),(4,7,'2026-04-16 14:00:23'),(4,8,'2026-04-16 16:23:22'),(7,3,'2026-04-21 10:14:05');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` (`id`, `name`, `locality`, `lat`, `lng`) VALUES (1,'Casa da Cultura de Bertamiráns','Bertamiráns',42.8590000,-8.6510000),(2,'Auditorio do Milladoiro','Milladoiro',42.8478100,-8.5931600),(4,'Parque do Ameneiro','Otras parroquias',42.8605640,-8.6537430),(5,'Biblioteca Municipal de Bertamiráns','Bertamiráns',42.8618100,-8.6547800),(6,'Escola Infantil Municipal O Bosque','Otras parroquias',42.8619000,-8.6553000),(7,'Escola Infantil Municipal A Madalena','Otras parroquias',42.8468000,-8.5905000),(8,'CEIP A Maía','Bertamiráns',42.8613900,-8.6525300),(9,'CEIP Agro do Muíño','Otras parroquias',42.8549000,-8.6389000),(10,'CEIP de Barouta','Otras parroquias',42.9104801,-8.6552924),(11,'CEP de Ventín','Otras parroquias',42.8529000,-8.6179000),(12,'Pavillón Municipal de Bertamiráns','Bertamiráns',42.8668900,-8.6583300),(13,'Pavillón Municipal do Milladoiro','Milladoiro',42.8472500,-8.5898600),(14,'Campo de fútbol municipal de Bertamiráns','Bertamiráns',42.8667500,-8.6581500),(15,'Campo de fútbol municipal do Milladoiro','Milladoiro',42.8439000,-8.5862000),(16,'Paseo fluvial de Bertamiráns','Bertamiráns',42.8612000,-8.6539000);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `organizers` WRITE;
/*!40000 ALTER TABLE `organizers` DISABLE KEYS */;
INSERT INTO `organizers` (`id`, `name`, `email`, `phone`) VALUES (1,'Concello de Ames','cultura@ames.gal','+34 981 000 101'),(2,'Biblioteca de Bertamiráns','biblioteca@ames.gal','+34 981 000 102'),(3,'Asociación Xogos en Familia','xogosfamilia@gmail.com','+34 622 334 455'),(4,'Club Deportivo O Milladoiro','clubmilladoiro@example.org','+34 981 000 103'),(5,'Concellaría de Deportes de Ames',NULL,'+34 981 883 002'),(6,'Concellaría de Educación de Ames',NULL,NULL),(7,'Escola Infantil Municipal O Bosque','eibertamirans@concellodeames.gal','+34 682 497 369'),(8,'Escola Infantil Municipal A Madalena','eiomilladoiro@concellodeames.gal','+34 981 538 433'),(9,'CEIP A Maía','ceip.a.maia@edu.xunta.gal','+34 881 866 002'),(10,'CEIP Agro do Muíño','ceip.agromuino@edu.xunta.es','+34 881 866 010'),(11,'CEIP de Barouta',NULL,'+34 881 867 455'),(12,'ANPA As Brañas de Ventín',NULL,'+34 627 537 271'),(13,'Bertamiráns FC','bertamiransfc@gmail.com','+34 881 087 583');
/*!40000 ALTER TABLE `organizers` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES (1,'admin','Acceso total al sistema','2026-04-16 11:03:19'),(2,'user','Usuario registrado con permisos basicos','2026-04-16 11:03:19'),(3,'content_manager','Gestion de contenidos y catalogos','2026-04-16 11:03:19');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `role_id`, `username`, `email`, `password_hash`, `created_at`, `is_active`, `email_verified`, `email_verification_token`, `verification_expires_at`, `password_reset_token`, `password_reset_expires_at`) VALUES (1,1,'admin','anx.o.varela@gmail.com','$2b$10$Dm7NxWxxzhwudNHvqGRrxO4oIkEVVc2/.xwi3QiC0hCXJ2B0NVLSW','2026-04-14 10:16:43',1,1,NULL,NULL,NULL,NULL),(2,2,'anxo','anxovarela@gmail.com','$2b$10$US5U6U5EMzVW9UAbCB0Cz.KhxolY9s/gc6P6gxsg.7SE8tM2riNna','2026-04-15 11:19:52',1,1,NULL,NULL,NULL,NULL),(3,3,'gestor','anxo.varela@gmail.com','$2b$10$dNAztVZXmkR6QzXS.9K67OTH79IuzA687z1LsrKxruRP56QuK3fz2','2026-04-16 11:13:32',1,1,NULL,NULL,NULL,NULL),(4,2,'proba','a.nxo.varela@gmail.com','$2b$10$B47Az.ZSoZ9CCyWz3HXsyelWH6n35dSH3p9Olgh0Af/jMMIGcgMvW','2026-04-16 12:13:25',1,1,NULL,NULL,NULL,NULL),(5,2,'proba2','anxovarel.a@gmail.com','$2b$10$n/y.Gku9vS5LpgOanEenOOc9ybztCX/saxUb9gdYsxJyZqF4HelCi','2026-04-16 12:45:37',1,1,NULL,NULL,NULL,NULL),(6,2,'pepe','anxo.va.rela@gmail.com','$2b$10$93NGE10nEkBzw3O8uN5VCO6ATFPKVgBhZCt4O6UuwlJWD3MLalV1C','2026-04-16 12:46:29',1,1,NULL,NULL,NULL,NULL),(7,2,'proba10','a.n.xovarela@gmail.com','$2b$10$9DiXLStYc2nk2wBAS6y/3.3aEdZ.9cE4E/xAPpMrGeoJudAa195ku','2026-04-21 08:50:55',1,1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

