const express = require('express');
const cors = require('cors');
const eventsRoutes = require('./src/routes/events');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/events', eventsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Ames Events funcionando 🚀');
});

// Puerto
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});