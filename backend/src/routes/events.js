const express = require('express');
const router = express.Router();

const events = [
  {
    id: 1,
    title: "Cuentacuentos en Ames",
    category: "Cultura",
    lat: 42.859,
    lng: -8.652
  },
  {
    id: 2,
    title: "Taller infantil",
    category: "Educación",
    lat: 42.861,
    lng: -8.654
  }
];

router.get('/', (req, res) => {
  res.json(events);
});

module.exports = router;