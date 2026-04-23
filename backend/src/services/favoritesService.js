const db = require('../config/db');

async function eventExists(eventId) {
  const [rows] = await db.query('SELECT id FROM events WHERE id = ? LIMIT 1', [eventId]);
  return rows.length > 0;
}

async function listFavoritesByUserId(userId) {
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
      f.created_at AS favorited_at
    FROM favorites f
    JOIN events e ON e.id = f.event_id
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN audiences a ON e.audience_id = a.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    JOIN locations l ON e.location_id = l.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC`,
    [userId]
  );

  return rows;
}

async function listFavoriteIdsByUserId(userId) {
  const [rows] = await db.query(
    `SELECT event_id
     FROM favorites
     WHERE user_id = ?`,
    [userId]
  );

  return rows.map((row) => Number(row.event_id));
}

async function addFavorite(userId, eventId) {
  await db.query(
    `INSERT INTO favorites (user_id, event_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE created_at = created_at`,
    [userId, eventId]
  );
}

async function removeFavorite(userId, eventId) {
  const [result] = await db.query(
    `DELETE FROM favorites
     WHERE user_id = ? AND event_id = ?`,
    [userId, eventId]
  );

  return result.affectedRows > 0;
}

module.exports = {
  eventExists,
  listFavoritesByUserId,
  listFavoriteIdsByUserId,
  addFavorite,
  removeFavorite
};
