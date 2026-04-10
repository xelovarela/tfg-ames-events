const db = require('../config/db');

async function listOrganizers() {
  const [rows] = await db.query(
    'SELECT id, name, email, phone FROM organizers ORDER BY name'
  );
  return rows;
}

async function getOrganizerById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone FROM organizers WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createOrganizer({ name, email, phone }) {
  const [result] = await db.query(
    'INSERT INTO organizers (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone]
  );
  return result.insertId;
}

async function updateOrganizer(id, { name, email, phone }) {
  const [result] = await db.query(
    'UPDATE organizers SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, id]
  );
  return result.affectedRows > 0;
}

async function deleteOrganizer(id) {
  const [result] = await db.query('DELETE FROM organizers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE organizer_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

module.exports = {
  listOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
  hasRelatedEvents
};
