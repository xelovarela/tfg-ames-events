const db = require('../config/db');

async function listAudiences() {
  const [rows] = await db.query(
    'SELECT id, name, age_min, age_max FROM audiences ORDER BY name'
  );
  return rows;
}

async function getAudienceById(id) {
  const [rows] = await db.query(
    'SELECT id, name, age_min, age_max FROM audiences WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createAudience({ name, ageMin, ageMax }) {
  const [result] = await db.query(
    'INSERT INTO audiences (name, age_min, age_max) VALUES (?, ?, ?)',
    [name, ageMin, ageMax]
  );
  return result.insertId;
}

async function updateAudience(id, { name, ageMin, ageMax }) {
  const [result] = await db.query(
    'UPDATE audiences SET name = ?, age_min = ?, age_max = ? WHERE id = ?',
    [name, ageMin, ageMax, id]
  );
  return result.affectedRows > 0;
}

async function deleteAudience(id) {
  const [result] = await db.query('DELETE FROM audiences WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE audience_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

module.exports = {
  listAudiences,
  getAudienceById,
  createAudience,
  updateAudience,
  deleteAudience,
  hasRelatedEvents
};
