const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, title, category, lat, lng FROM events');
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({ error: 'Error retrieving events from database' });
  }
});

module.exports = router;