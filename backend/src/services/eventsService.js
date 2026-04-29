/**
 * Este archivo implementa la capa de servicios de eventos.
 * Contiene las consultas SQL y encapsula el acceso a datos para que el controlador
 * pueda trabajar con operaciones de alto nivel sin conocer los detalles de MySQL.
 */
const db = require('../config/db');
const { TIME_SCOPES, buildIsPastSelect, buildTimeScopeWhereClause } = require('../utils/eventTime');

// Recupera el listado de eventos junto con los nombres legibles de sus relaciones.
async function listEvents({ timeScope = TIME_SCOPES.UPCOMING } = {}) {
  const timeScopeWhereClause = buildTimeScopeWhereClause(timeScope, 'e');

  const [rows] = await db.query(
    `SELECT 
      e.id,
      e.title,
      e.description,
      e.image_url,
      e.event_date,
      e.is_free,
      e.price,
      e.min_age,
      e.max_age,
      e.audience_id,
      e.organizer_id,
      c.name AS category,
      a.name AS audience,
      o.name AS organizer,
      l.name AS location,
      l.locality AS location_locality,
      l.lat,
      l.lng,
      ${buildIsPastSelect('e')},
      COALESCE(fc.favorite_count, 0) AS favorite_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN audiences a ON e.audience_id = a.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    JOIN locations l ON e.location_id = l.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS favorite_count
      FROM favorites
      GROUP BY event_id
    ) fc ON fc.event_id = e.id
    WHERE 1 = 1
      ${timeScopeWhereClause}
    ORDER BY e.id`
  );

  return rows;
}

// Obtiene un único evento con todos los datos necesarios para detalle y edición.
async function getEventById(id) {
  const [rows] = await db.query(
    `SELECT 
      e.id,
      e.title,
      e.description,
      e.image_url,
      e.event_date,
      e.is_free,
      e.price,
      e.min_age,
      e.max_age,
      e.audience_id,
      e.organizer_id,
      c.name AS category,
      a.name AS audience,
      o.name AS organizer,
      l.name AS location,
      l.locality AS location_locality,
      l.lat,
      l.lng,
      e.category_id,
      e.location_id,
      ${buildIsPastSelect('e')},
      COALESCE(fc.favorite_count, 0) AS favorite_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN audiences a ON e.audience_id = a.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    JOIN locations l ON e.location_id = l.id
    LEFT JOIN (
      SELECT event_id, COUNT(*) AS favorite_count
      FROM favorites
      GROUP BY event_id
    ) fc ON fc.event_id = e.id
    WHERE e.id = ?`,
    [id]
  );

  return rows[0] || null;
}

// Comprueba si la categoría indicada existe antes de crear o editar un evento.
async function categoryExists(categoryId) {
  const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
  return rows.length > 0;
}

// Comprueba si la ubicación indicada existe.
async function locationExists(locationId) {
  const [rows] = await db.query('SELECT id FROM locations WHERE id = ?', [locationId]);
  return rows.length > 0;
}

// Comprueba si la audiencia indicada existe cuándo el campo es opcional.
async function audienceExists(audienceId) {
  const [rows] = await db.query('SELECT id FROM audiences WHERE id = ?', [audienceId]);
  return rows.length > 0;
}

// Comprueba si el organizador indicado existe cuándo viene informado.
async function organizerExists(organizerId) {
  const [rows] = await db.query('SELECT id FROM organizers WHERE id = ?', [organizerId]);
  return rows.length > 0;
}

// Inserta un nuevo evento con todos los campos ya validados por el controlador.
async function createEvent({
  title,
  description,
  categoryId,
  locationId,
  audienceId,
  organizerId,
  eventDate,
  isFree,
  price,
  minAge,
  maxAge,
  imageUrl
}) {
  const [result] = await db.query(
    `INSERT INTO events 
      (title, description, image_url, category_id, location_id, audience_id, organizer_id, event_date, is_free, price, min_age, max_age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, imageUrl, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge]
  );

  return result.insertId;
}

// Actualiza el registro de un evento existente usando una sentencia parametrizada.
async function updateEvent(
  id,
  { title, description, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge, imageUrl }
) {
  const [result] = await db.query(
    `UPDATE events 
      SET title = ?, description = ?, image_url = ?, category_id = ?, location_id = ?, audience_id = ?, organizer_id = ?, event_date = ?, is_free = ?,
          price = ?, min_age = ?, max_age = ?
     WHERE id = ?`,
    [title, description, imageUrl, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge, id]
  );

  return result.affectedRows > 0;
}

// Borra un evento por id e informa si realmente se elimino alguna fila.
async function deleteEvent(id) {
  const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Se exportan todas las operaciones de acceso a datos del modulo de eventos.
module.exports = {
  listEvents,
  getEventById,
  categoryExists,
  locationExists,
  audienceExists,
  organizerExists,
  createEvent,
  updateEvent,
  deleteEvent
};
