/**
 * Este archivo es el punto de entrada del backend.
 * Crea la aplicacion Express, registra los middlewares globales y monta las rutas REST
 * que permiten gestionar eventos, categorias, ubicaciones, audiencias y organizadores.
 */
﻿const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRoutes = require('./src/routes/events');
const categoriesRoutes = require('./src/routes/categories');
const locationsRoutes = require('./src/routes/locations');
const audiencesRoutes = require('./src/routes/audiences');
const organizersRoutes = require('./src/routes/organizers');
const authRoutes = require('./src/routes/auth');
const usersRoutes = require('./src/routes/users');
const rolesRoutes = require('./src/routes/roles');
const favoritesRoutes = require('./src/routes/favorites');
const alertsRoutes = require('./src/routes/alerts');
const { startFavoriteReminderJob } = require('./src/jobs/favoriteReminderJob');

const app = express();

// Se inicializa la aplicacion principal de Express antes de registrar cualquier ruta.

const allowedCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middlewares
// Se habilita CORS para permitir peticiones desde el frontend y se activa el parseo de JSON.
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedCorsOrigins.length === 0 || allowedCorsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());
app.use('/auth', authRoutes);

// Ruta de prueba para comprobar rapidamente que la API esta levantada.
app.get('/', (req, res) => {
  res.send('API Ames Events funcionando');
});

// Cada grupo de endpoints se delega a su router especifico para mantener el servidor organizado.
app.use('/events', eventsRoutes);

app.use('/categories', categoriesRoutes);
app.use('/locations', locationsRoutes);
app.use('/audiences', audiencesRoutes);
app.use('/organizers', organizersRoutes);
app.use('/users', usersRoutes);
app.use('/roles', rolesRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/alerts', alertsRoutes);

const pool = require('./src/config/db');

// Verificar el charset y collation de la base de datos al iniciar.
(async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT @@character_set_database AS charset, @@collation_database AS collation'
    );
    const { charset, collation } = rows[0];

    console.log(`Charset de la BD: ${charset}; collation: ${collation}`);
    if (charset !== 'utf8mb4' || collation !== 'utf8mb4_unicode_ci') {
      console.warn('Advertencia: La BD deberia usar utf8mb4 con utf8mb4_unicode_ci para evitar problemas de caracteres.');
    }
  } catch (err) {
    console.error('Error verificando charset/collation:', err);
  }
})();

// El puerto puede llegar desde variables de entorno o usar el valor local por defecto.
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  startFavoriteReminderJob();
});
