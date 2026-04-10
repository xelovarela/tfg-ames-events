const db = require('../config/db');

async function listEvents() {
  const [rows] = await db.query(
    `SELECT 
      e.id,
      e.title,
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
      l.lat,
      l.lng
    FROM events e
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN audiences a ON e.audience_id = a.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    JOIN locations l ON e.location_id = l.id
    ORDER BY e.id`
  );

  return rows;
}

async function getEventById(id) {
  const [rows] = await db.query(
    `SELECT 
      e.id,
      e.title,
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
      l.lat,
      l.lng,
      e.category_id,
      e.location_id
    FROM events e
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN audiences a ON e.audience_id = a.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    JOIN locations l ON e.location_id = l.id
    WHERE e.id = ?`,
    [id]
  );

  return rows[0] || null;
}

async function categoryExists(categoryId) {
  const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
  return rows.length > 0;
}

async function locationExists(locationId) {
  const [rows] = await db.query('SELECT id FROM locations WHERE id = ?', [locationId]);
  return rows.length > 0;
}

async function audienceExists(audienceId) {
  const [rows] = await db.query('SELECT id FROM audiences WHERE id = ?', [audienceId]);
  return rows.length > 0;
}

async function organizerExists(organizerId) {
  const [rows] = await db.query('SELECT id FROM organizers WHERE id = ?', [organizerId]);
  return rows.length > 0;
}

async function createEvent({
  title,
  categoryId,
  locationId,
  audienceId,
  organizerId,
  eventDate,
  isFree,
  price,
  minAge,
  maxAge
}) {
  const [result] = await db.query(
    `INSERT INTO events 
      (title, category_id, location_id, audience_id, organizer_id, event_date, is_free, price, min_age, max_age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge]
  );

  return result.insertId;
}

async function updateEvent(
  id,
  { title, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge }
) {
  const [result] = await db.query(
    `UPDATE events 
      SET title = ?, category_id = ?, location_id = ?, audience_id = ?, organizer_id = ?, event_date = ?, is_free = ?, 
          price = ?, min_age = ?, max_age = ?
     WHERE id = ?`,
    [title, categoryId, locationId, audienceId, organizerId, eventDate, isFree, price, minAge, maxAge, id]
  );

  return result.affectedRows > 0;
}

async function deleteEvent(id) {
  const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

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
