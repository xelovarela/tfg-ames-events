const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /events
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.title,
        c.name AS category,
        l.name AS location,
        l.lat,
        l.lng
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN locations l ON e.location_id = l.id
      ORDER BY e.id
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({ error: 'Error retrieving events from database' });
  }
});

// GET /events/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.title,
        c.name AS category,
        l.name AS location,
        l.lat,
        l.lng,
        e.category_id,
        e.location_id
      FROM events e
      JOIN categories c ON e.category_id = c.id
      JOIN locations l ON e.location_id = l.id
      WHERE e.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({ error: 'Error retrieving event from database' });
  }
});

// POST /events
router.post('/', async (req, res) => {
  try {
    const { title, category_id, location_id } = req.body;

    if (!title || !category_id || !location_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO events (title, category_id, location_id) VALUES (?, ?, ?)',
      [title, category_id, location_id]
    );

    res.status(201).json({
      message: 'Event created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Error creating event in database' });
  }
});

// PUT /events/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category_id, location_id } = req.body;

    if (!title || !category_id || !location_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE events SET title = ?, category_id = ?, location_id = ? WHERE id = ?',
      [title, category_id, location_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event in database' });
  }
});

// DELETE /events/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM events WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event from database' });
  }
});

module.exports = router;