const db = require('../config/db');

async function getUserByLogin(login) {
  const [rows] = await db.query(
    `SELECT 
      u.id,
      u.username,
      u.email,
      u.password_hash,
      u.role_id,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.username = ? OR u.email = ?
     LIMIT 1`,
    [login, login]
  );

  return rows[0] || null;
}

module.exports = {
  getUserByLogin
};