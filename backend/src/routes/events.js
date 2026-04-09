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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT id, title, category, lat, lng FROM events WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error retrieving event:', error);
    res.status(500).json({ error: 'Error retrieving event from database' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, lat, lng } = req.body;

    if (!title || !category || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'INSERT INTO events (title, category, lat, lng) VALUES (?, ?, ?, ?)',
      [title, category, lat, lng]
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, lat, lng } = req.body;

    if (!title || !category || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await db.query(
      'UPDATE events SET title = ?, category = ?, lat = ?, lng = ? WHERE id = ?',
      [title, category, lat, lng, id]
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