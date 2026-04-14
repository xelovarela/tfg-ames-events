/**
 * Este archivo implementa la capa de servicios de organizadores.
 * Agrupa las consultas SQL para el mantenimiento del catalogo de organizadores
 * y las comprobaciones de integridad con la tabla de eventos.
 */
const db = require('../config/db');

// Devuelve todos los organizadores ordenados alfabeticamente.
async function listOrganizers() {
  const [rows] = await db.query(
    'SELECT id, name, email, phone FROM organizers ORDER BY name'
  );
  return rows;
}

// Recupera un organizador concreto por id.
async function getOrganizerById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, phone FROM organizers WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Inserta un nuevo organizador con sus datos de contacto opcionales.
async function createOrganizer({ name, email, phone }) {
  const [result] = await db.query(
    'INSERT INTO organizers (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone]
  );
  return result.insertId;
}

// Actualiza los datos de un organizador existente.
async function updateOrganizer(id, { name, email, phone }) {
  const [result] = await db.query(
    'UPDATE organizers SET name = ?, email = ?, phone = ? WHERE id = ?',
    [name, email, phone, id]
  );
  return result.affectedRows > 0;
}

// Elimina un organizador por id.
async function deleteOrganizer(id) {
  const [result] = await db.query('DELETE FROM organizers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Comprueba si existen eventos asociados que bloqueen el borrado.
async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE organizer_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

// Se exportan las operaciones de acceso a datos del modulo.
module.exports = {
  listOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
  hasRelatedEvents
};
