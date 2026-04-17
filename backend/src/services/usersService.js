/**
 * Este archivo implementa la capa de servicios de usuarios.
 * Centraliza las consultas SQL seguras usadas por la administracion de usuarios.
 * Las lecturas publicas del modulo no devuelven password_hash ni tokens.
 */
const db = require('../config/db');

function normalizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    is_active: Number(row.is_active) === 1,
    email_verified: Number(row.email_verified) === 1,
    created_at: row.created_at
  };
}

async function listUsers() {
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.is_active,
      u.email_verified,
      u.created_at,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC, u.id DESC`
  );

  return rows.map(normalizeUser);
}

async function getUserById(id) {
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.is_active,
      u.email_verified,
      u.created_at,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  return normalizeUser(rows[0]);
}

async function getUserCredentialsById(id) {
  const [rows] = await db.query(
    `SELECT id, password_hash
     FROM users
     WHERE id = ?
     LIMIT 1`,
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

async function getUserByUsernameExcludingId(username, excludedId) {
  const [rows] = await db.query(
    `SELECT id, username
     FROM users
     WHERE username = ?
       AND id <> ?
     LIMIT 1`,
    [username, excludedId]
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

async function updateOwnUsername(id, username) {
  const [result] = await db.query(
    `UPDATE users
     SET username = ?
     WHERE id = ?`,
    [username, id]
  );

  return result.affectedRows > 0;
}

async function updateOwnPassword(id, passwordHash) {
  const [result] = await db.query(
    `UPDATE users
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, id]
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

async function updateUserRole(id, roleId) {
  const [result] = await db.query(
    `UPDATE users
     SET role_id = ?
     WHERE id = ?`,
    [roleId, id]
  );

  return result.affectedRows > 0;
}

async function updateUserStatus(id, isActive) {
  const [result] = await db.query(
    `UPDATE users
     SET is_active = ?
     WHERE id = ?`,
    [isActive ? 1 : 0, id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  listUsers,
  getUserById,
  getUserCredentialsById,
  getUserByUsernameOrEmail,
  getUserByUsernameOrEmailExcludingId,
  getUserByUsernameExcludingId,
  createUser,
  updateUser,
  updateOwnUsername,
  updateOwnPassword,
  updateUserWithPassword,
  deleteUser,
  updateUserRole,
  updateUserStatus
};
