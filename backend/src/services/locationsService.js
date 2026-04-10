const db = require('../config/db');

async function listLocations() {
  const [rows] = await db.query(
    'SELECT id, name, lat, lng FROM locations ORDER BY name'
  );
  return rows;
}

async function getLocationById(id) {
  const [rows] = await db.query(
    'SELECT id, name, lat, lng FROM locations WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createLocation({ name, lat, lng }) {
  const [result] = await db.query(
    'INSERT INTO locations (name, lat, lng) VALUES (?, ?, ?)',
    [name, lat, lng]
  );
  return result.insertId;
}

async function updateLocation(id, { name, lat, lng }) {
  const [result] = await db.query(
    'UPDATE locations SET name = ?, lat = ?, lng = ? WHERE id = ?',
    [name, lat, lng, id]
  );
  return result.affectedRows > 0;
}

async function deleteLocation(id) {
  const [result] = await db.query(
    'DELETE FROM locations WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE location_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

module.exports = {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  hasRelatedEvents
};
