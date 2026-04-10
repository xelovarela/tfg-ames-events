const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /audiences
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, age_min, age_max FROM audiences ORDER BY name'
    );

    return res.json(rows);
  } catch (error) {
    console.error('Error retrieving audiences:', error);
    return res.status(500).json({ error: 'Error retrieving audiences from database' });
  }
});

module.exports = router;
