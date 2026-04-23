/**
 * Este archivo implementa la capa de servicios de ubicaciones.
 * Encapsula las consultas SQL necesarias para listar, crear, modificar y borrar
 * puntos geograficos usados por los eventos.
 */
const db = require('../config/db');

// Devuelve todas las ubicaciones disponibles para el frontend.
async function listLocations() {
  const [rows] = await db.query(
    'SELECT id, name, locality, lat, lng FROM locations ORDER BY locality, name'
  );
  return rows;
}

// Recupera una ubicacion concreta por id.
async function getLocationById(id) {
  const [rows] = await db.query(
    'SELECT id, name, locality, lat, lng FROM locations WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Inserta una nueva ubicacion con nombre y coordenadas.
async function createLocation({ name, locality, lat, lng }) {
  const [result] = await db.query(
    'INSERT INTO locations (name, locality, lat, lng) VALUES (?, ?, ?, ?)',
    [name, locality, lat, lng]
  );
  return result.insertId;
}

// Actualiza los datos de una ubicacion ya existente.
async function updateLocation(id, { name, locality, lat, lng }) {
  const [result] = await db.query(
    'UPDATE locations SET name = ?, locality = ?, lat = ?, lng = ? WHERE id = ?',
    [name, locality, lat, lng, id]
  );
  return result.affectedRows > 0;
}

// Elimina una ubicacion concreta y devuelve si hubo cambios.
async function deleteLocation(id) {
  const [result] = await db.query(
    'DELETE FROM locations WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// Comprueba si algun evento usa la ubicacion antes de borrarla.
async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE location_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

// Se exportan las operaciones de acceso a datos del modulo.
module.exports = {
  listLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  hasRelatedEvents
};
