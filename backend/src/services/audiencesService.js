/**
 * Este archivo implementa la capa de servicios de audiencias.
 * Contiene las consultas SQL necesarias para mantener el catalogo de audiencias
 * y verificar si estan siendo utilizadas por eventos.
 */
const db = require('../config/db');

// Devuelve todas las audiencias ordenadas por nombre.
async function listAudiences() {
  const [rows] = await db.query(
    'SELECT id, name, age_min, age_max FROM audiences ORDER BY name'
  );
  return rows;
}

// Recupera una audiencia concreta por id.
async function getAudienceById(id) {
  const [rows] = await db.query(
    'SELECT id, name, age_min, age_max FROM audiences WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Inserta una nueva audiencia con su rango de edades opcional.
async function createAudience({ name, ageMin, ageMax }) {
  const [result] = await db.query(
    'INSERT INTO audiences (name, age_min, age_max) VALUES (?, ?, ?)',
    [name, ageMin, ageMax]
  );
  return result.insertId;
}

// Actualiza una audiencia existente.
async function updateAudience(id, { name, ageMin, ageMax }) {
  const [result] = await db.query(
    'UPDATE audiences SET name = ?, age_min = ?, age_max = ? WHERE id = ?',
    [name, ageMin, ageMax, id]
  );
  return result.affectedRows > 0;
}

// Elimina una audiencia si ya no se usa en eventos.
async function deleteAudience(id) {
  const [result] = await db.query('DELETE FROM audiences WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Comprueba si algun evento apunta a esta audiencia.
async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE audience_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

// Se exportan las operaciones de acceso a datos del modulo.
module.exports = {
  listAudiences,
  getAudienceById,
  createAudience,
  updateAudience,
  deleteAudience,
  hasRelatedEvents
};
