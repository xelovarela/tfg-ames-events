const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name FROM categories ORDER BY name'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.status(500).json({ error: 'Error retrieving categories from database' });
  }
});

module.exports = router;