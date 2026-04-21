const db = require('../config/db');
const emailService = require('./emailService');

function toDateOnly(value) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTomorrowDateOnly() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return toDateOnly(tomorrow);
}

async function listPendingFavoriteReminders(targetDate = getTomorrowDateOnly()) {
  const [rows] = await db.query(
    `SELECT
      u.id AS user_id,
      u.username,
      u.email,
      e.id,
      e.title,
      e.description,
      e.event_date,
      l.name AS location,
      o.name AS organizer
     FROM favorites f
     JOIN users u ON u.id = f.user_id
     JOIN events e ON e.id = f.event_id
     JOIN locations l ON l.id = e.location_id
     LEFT JOIN organizers o ON o.id = e.organizer_id
     LEFT JOIN favorite_event_reminders fer
       ON fer.user_id = f.user_id
      AND fer.event_id = f.event_id
      AND fer.reminder_for = DATE(e.event_date)
     WHERE u.is_active = 1
       AND u.email_verified = 1
       AND e.event_date >= ?
       AND e.event_date < DATE_ADD(?, INTERVAL 1 DAY)
       AND fer.user_id IS NULL
     ORDER BY e.event_date, e.id, u.id`,
    [targetDate, targetDate]
  );

  return rows;
}

async function markReminderSent(userId, eventId, reminderFor) {
  await db.query(
    `INSERT INTO favorite_event_reminders (user_id, event_id, reminder_for)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE sent_at = sent_at`,
    [userId, eventId, reminderFor]
  );
}

async function sendFavoriteRemindersForDate(targetDate = getTomorrowDateOnly()) {
  const reminders = await listPendingFavoriteReminders(targetDate);
  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    try {
      const result = await emailService.sendFavoriteReminderEmail({
        to: reminder.email,
        name: reminder.username,
        event: reminder
      });

      if (result.delivered) {
        await markReminderSent(reminder.user_id, reminder.id, targetDate);
        sent += 1;
      }
    } catch (error) {
      failed += 1;
      console.error(`Error sending favorite reminder for user ${reminder.user_id} and event ${reminder.id}:`, error);
    }
  }

  return { checked: reminders.length, sent, failed, targetDate };
}

module.exports = {
  getTomorrowDateOnly,
  listPendingFavoriteReminders,
  sendFavoriteRemindersForDate
};
