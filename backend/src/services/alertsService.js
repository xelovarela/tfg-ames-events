/**
 * Servicio de alertas de eventos.
 * Centraliza persistencia, validacion de relaciones y matching contra eventos nuevos.
 */
const db = require('../config/db');
const emailService = require('./emailService');

function normalizeAlert(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    category_id: row.category_id,
    category: row.category,
    location_id: row.location_id,
    location: row.location,
    audience_id: row.audience_id,
    audience: row.audience,
    min_age: row.min_age,
    max_age: row.max_age,
    keyword: row.keyword,
    is_active: Number(row.is_active) === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function alertHasCriteria(alert) {
  return Boolean(
    alert.category_id !== null ||
    alert.location_id !== null ||
    alert.audience_id !== null ||
    alert.min_age !== null ||
    alert.max_age !== null ||
    alert.keyword
  );
}

async function listAlertsByUserId(userId) {
  const [rows] = await db.query(
    `SELECT
      al.id,
      al.user_id,
      al.name,
      al.category_id,
      c.name AS category,
      al.location_id,
      l.name AS location,
      al.audience_id,
      au.name AS audience,
      al.min_age,
      al.max_age,
      al.keyword,
      al.is_active,
      al.created_at,
      al.updated_at
     FROM alerts al
     LEFT JOIN categories c ON al.category_id = c.id
     LEFT JOIN locations l ON al.location_id = l.id
     LEFT JOIN audiences au ON al.audience_id = au.id
     WHERE al.user_id = ?
     ORDER BY al.created_at DESC, al.id DESC`,
    [userId]
  );

  return rows.map(normalizeAlert);
}

async function getAlertByIdAndUserId(id, userId) {
  const [rows] = await db.query(
    `SELECT
      al.id,
      al.user_id,
      al.name,
      al.category_id,
      c.name AS category,
      al.location_id,
      l.name AS location,
      al.audience_id,
      au.name AS audience,
      al.min_age,
      al.max_age,
      al.keyword,
      al.is_active,
      al.created_at,
      al.updated_at
     FROM alerts al
     LEFT JOIN categories c ON al.category_id = c.id
     LEFT JOIN locations l ON al.location_id = l.id
     LEFT JOIN audiences au ON al.audience_id = au.id
     WHERE al.id = ? AND al.user_id = ?
     LIMIT 1`,
    [id, userId]
  );

  return normalizeAlert(rows[0]);
}

async function createAlert(userId, alert) {
  const [result] = await db.query(
    `INSERT INTO alerts
      (user_id, name, category_id, location_id, audience_id, min_age, max_age, keyword, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      alert.name,
      alert.categoryId,
      alert.locationId,
      alert.audienceId,
      alert.minAge,
      alert.maxAge,
      alert.keyword,
      alert.isActive ? 1 : 0
    ]
  );

  return result.insertId;
}

async function updateAlert(id, userId, alert) {
  const [result] = await db.query(
    `UPDATE alerts
     SET name = ?,
         category_id = ?,
         location_id = ?,
         audience_id = ?,
         min_age = ?,
         max_age = ?,
         keyword = ?,
         is_active = ?
     WHERE id = ? AND user_id = ?`,
    [
      alert.name,
      alert.categoryId,
      alert.locationId,
      alert.audienceId,
      alert.minAge,
      alert.maxAge,
      alert.keyword,
      alert.isActive ? 1 : 0,
      id,
      userId
    ]
  );

  return result.affectedRows > 0;
}

async function updateAlertStatus(id, userId, isActive) {
  const [result] = await db.query(
    `UPDATE alerts
     SET is_active = ?
     WHERE id = ? AND user_id = ?`,
    [isActive ? 1 : 0, id, userId]
  );

  return result.affectedRows > 0;
}

async function deleteAlert(id, userId) {
  const [result] = await db.query(
    `DELETE FROM alerts
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  return result.affectedRows > 0;
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

async function listActiveAlertsForNotifications() {
  const [rows] = await db.query(
    `SELECT
      al.id,
      al.name,
      al.category_id,
      al.location_id,
      al.audience_id,
      al.min_age,
      al.max_age,
      al.keyword,
      u.id AS user_id,
      u.username,
      u.email
     FROM alerts al
     JOIN users u ON al.user_id = u.id
     WHERE al.is_active = 1
       AND u.is_active = 1
       AND u.email_verified = 1
       AND (
         al.category_id IS NOT NULL
         OR al.location_id IS NOT NULL
         OR al.audience_id IS NOT NULL
         OR al.min_age IS NOT NULL
         OR al.max_age IS NOT NULL
         OR al.keyword IS NOT NULL
       )`
  );

  return rows;
}

function keywordMatches(alert, event) {
  if (!alert.keyword) {
    return true;
  }

  const keyword = alert.keyword.toLowerCase();
  const searchableText = `${event.title || ''} ${event.description || ''}`.toLowerCase();
  return searchableText.includes(keyword);
}

function ageMatches(alert, event) {
  if (alert.min_age === null && alert.max_age === null) {
    return true;
  }

  if (event.min_age === null || event.max_age === null) {
    return false;
  }

  const alertMin = alert.min_age !== null ? Number(alert.min_age) : Number.NEGATIVE_INFINITY;
  const alertMax = alert.max_age !== null ? Number(alert.max_age) : Number.POSITIVE_INFINITY;
  const eventMin = Number(event.min_age);
  const eventMax = Number(event.max_age);

  return eventMin <= alertMax && eventMax >= alertMin;
}

function alertMatchesEvent(alert, event) {
  if (alert.category_id !== null && Number(alert.category_id) !== Number(event.category_id)) {
    return false;
  }

  if (alert.location_id !== null && Number(alert.location_id) !== Number(event.location_id)) {
    return false;
  }

  if (alert.audience_id !== null && Number(alert.audience_id) !== Number(event.audience_id)) {
    return false;
  }

  return keywordMatches(alert, event) && ageMatches(alert, event);
}

async function notifyMatchingAlertsForEvent(event) {
  const alerts = await listActiveAlertsForNotifications();
  const sentKeys = new Set();
  let sentCount = 0;

  for (const alert of alerts) {
    if (!alertMatchesEvent(alert, event)) {
      continue;
    }

    const dedupeKey = `${alert.user_id}:${alert.id}:${event.id}`;
    if (sentKeys.has(dedupeKey)) {
      continue;
    }
    sentKeys.add(dedupeKey);

    try {
      await emailService.sendEventAlertEmail({
        to: alert.email,
        name: alert.username,
        alertName: alert.name,
        event
      });
      sentCount += 1;
    } catch (error) {
      console.error(`Error sending alert ${alert.id} for event ${event.id}:`, error);
    }
  }

  return { checked: alerts.length, sent: sentCount };
}

module.exports = {
  listAlertsByUserId,
  getAlertByIdAndUserId,
  createAlert,
  updateAlert,
  updateAlertStatus,
  deleteAlert,
  categoryExists,
  locationExists,
  audienceExists,
  alertHasCriteria,
  notifyMatchingAlertsForEvent
};
