/**
 * Este archivo implementa la capa de servicios de usuarios.
 * Centraliza las consultas SQL del CRUD de usuarios y evita devolver
 * password_hash fuera de las operaciones internas que lo necesiten.
 */
const db = require('../config/db');

async function listUsers() {
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.role_id,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     ORDER BY u.id`
  );

  return rows;
}

async function getUserById(id) {
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.role_id,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [id]
  );

  return rows[0] || null;
}

async function getUserByUsernameOrEmail(username, email) {
  const [rows] = await db.query(
    `SELECT id, username, email
     FROM users
     WHERE username = ? OR email = ?
     LIMIT 1`,
    [username, email]
  );

  return rows[0] || null;
}

async function getUserByUsernameOrEmailExcludingId(username, email, excludedId) {
  const [rows] = await db.query(
    `SELECT id, username, email
     FROM users
     WHERE (username = ? OR email = ?)
       AND id <> ?
     LIMIT 1`,
    [username, email, excludedId]
  );

  return rows[0] || null;
}

async function createUser({ username, email, passwordHash, roleId }) {
  const [result] = await db.query(
    `INSERT INTO users (username, email, password_hash, role_id)
     VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, roleId]
  );

  return result.insertId;
}

async function updateUser(id, { username, email, roleId }) {
  const [result] = await db.query(
    `UPDATE users
     SET username = ?, email = ?, role_id = ?
     WHERE id = ?`,
    [username, email, roleId, id]
  );

  return result.affectedRows > 0;
}

async function updateUserWithPassword(id, { username, email, roleId, passwordHash }) {
  const [result] = await db.query(
    `UPDATE users
     SET username = ?, email = ?, role_id = ?, password_hash = ?
     WHERE id = ?`,
    [username, email, roleId, passwordHash, id]
  );

  return result.affectedRows > 0;
}

async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  listUsers,
  getUserById,
  getUserByUsernameOrEmail,
  getUserByUsernameOrEmailExcludingId,
  createUser,
  updateUser,
  updateUserWithPassword,
  deleteUser
};
