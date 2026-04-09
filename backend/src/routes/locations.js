const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /locations
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, lat, lng FROM locations ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving locations:', error);
    res.status(500).json({ error: 'Error retrieving locations from database' });
  }
});

module.exports = router;