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

const app = express();

// Se inicializa la aplicacion principal de Express antes de registrar cualquier ruta.

// Middlewares
// Se habilita CORS para permitir peticiones desde el frontend y se activa el parseo de JSON.
app.use(cors());
app.use(express.json());

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

// El puerto puede llegar desde variables de entorno o usar el valor local por defecto.
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
