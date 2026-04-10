const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRoutes = require('./src/routes/events');
const categoriesRoutes = require('./src/routes/categories');
const locationsRoutes = require('./src/routes/locations');
const audiencesRoutes = require('./src/routes/audiences');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Ames Events funcionando');
});

// Ruta de eventos, categorias y ubicaciones
app.use('/events', eventsRoutes);

app.use('/categories', categoriesRoutes);
app.use('/locations', locationsRoutes);
app.use('/audiences', audiencesRoutes);

// Puerto
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
