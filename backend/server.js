const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRoutes = require('./src/routes/events');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Ames Events funcionando 🚀');
});

// Ruta de eventos
app.use('/events', eventsRoutes);

// Puerto
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});