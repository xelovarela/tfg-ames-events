 
const express = require('express');
const router = express.Router();

// Mock data temporal
const events = [
  {
    id: 1,
    title: "Cuentacuentos en Ames",
    lat: 42.859,
    lng: -8.652
  },
  {
    id: 2,
    title: "Taller infantil",
    lat: 42.861,
    lng: -8.654
  }
];

// GET /events
router.get('/', (req, res) => {
  res.json(events);
});

module.exports = router;