const db = require('../config/db');

const VERIFICATION_COLUMNS = [
  { name: 'is_active', sql: 'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1' },
  { name: 'email_verified', sql: 'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0' },
  { name: 'email_verification_token', sql: 'ALTER TABLE users ADD COLUMN email_verification_token VARCHAR(255) NULL' },
  { name: 'verification_expires_at', sql: 'ALTER TABLE users ADD COLUMN verification_expires_at DATETIME NULL' },
  { name: 'password_reset_token', sql: 'ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255) NULL' },
  { name: 'password_reset_expires_at', sql: 'ALTER TABLE users ADD COLUMN password_reset_expires_at DATETIME NULL' }
];

let usersMetaPromise = null;

async function getUsersMeta() {
  if (!usersMetaPromise) {
    usersMetaPromise = (async () => {
      const [rows] = await db.query(
        `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'users'`
      );

      const columns = new Set(rows.map((row) => row.COLUMN_NAME));
      const identityColumn = columns.has('username')
        ? 'username'
        : columns.has('name')
          ? 'name'
          : null;

      if (!identityColumn) {
        throw new Error('users table must include either username or name column.');
      }

      for (const column of VERIFICATION_COLUMNS) {
        if (!columns.has(column.name)) {
          await db.query(column.sql);
        }
      }

      return { identityColumn };
    })().catch((error) => {
      usersMetaPromise = null;
      throw error;
    });
  }

  return usersMetaPromise;
}

async function getUserByLogin(login) {
  const { identityColumn } = await getUsersMeta();
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.${identityColumn} AS username,
      u.email,
      u.password_hash,
      u.role_id,
      u.is_active,
      u.email_verified,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.${identityColumn} = ? OR u.email = ?
     LIMIT 1`,
    [login, login]
  );

  return rows[0] || null;
}

async function getRoleByName(roleName) {
  const [rows] = await db.query(
    `SELECT id, name
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [roleName]
  );

  return rows[0] || null;
}

async function getUserByEmail(email) {
  const { identityColumn } = await getUsersMeta();
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.${identityColumn} AS username,
      u.email,
      u.email_verified,
      u.is_active
     FROM users u
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function storePasswordResetToken(userId, token, resetExpiresAt) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET password_reset_token = ?,
         password_reset_expires_at = ?
     WHERE id = ?`,
    [token, resetExpiresAt, userId]
  );
}

async function getUserByPasswordResetToken(token) {
  const { identityColumn } = await getUsersMeta();
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.${identityColumn} AS username,
      u.email,
      u.password_reset_token,
      u.password_reset_expires_at
     FROM users u
     WHERE u.password_reset_token = ?
     LIMIT 1`,
    [token]
  );

  return rows[0] || null;
}

async function updatePasswordAndClearResetToken(userId, passwordHash) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET password_hash = ?,
         password_reset_token = NULL,
         password_reset_expires_at = NULL
     WHERE id = ?`,
    [passwordHash, userId]
  );
}

async function clearPasswordResetToken(userId) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET password_reset_token = NULL,
         password_reset_expires_at = NULL
     WHERE id = ?`,
    [userId]
  );
}

async function createRegisteredUser({
  name,
  email,
  passwordHash,
  roleId,
  emailVerified,
  verificationToken,
  verificationExpiresAt
}) {
  const { identityColumn } = await getUsersMeta();
  const [result] = await db.query(
    `INSERT INTO users (
      ${identityColumn},
      email,
      password_hash,
      role_id,
      is_active,
      email_verified,
      email_verification_token,
      verification_expires_at
    ) VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
    [
      name,
      email,
      passwordHash,
      roleId,
      emailVerified ? 1 : 0,
      verificationToken,
      verificationExpiresAt
    ]
  );

  return result.insertId;
}

async function storeVerificationToken(userId, token, verificationExpiresAt) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET email_verification_token = ?,
         verification_expires_at = ?
     WHERE id = ?`,
    [token, verificationExpiresAt, userId]
  );
}

async function getUserByVerificationToken(token) {
  const { identityColumn } = await getUsersMeta();
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.${identityColumn} AS username,
      u.email,
      u.email_verified,
      u.email_verification_token,
      u.verification_expires_at
     FROM users u
     WHERE u.email_verification_token = ?
     LIMIT 1`,
    [token]
  );

  return rows[0] || null;
}

async function markEmailAsVerified(userId) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET email_verified = 1,
         email_verification_token = NULL,
         verification_expires_at = NULL
     WHERE id = ?`,
    [userId]
  );
}

async function clearVerificationToken(userId) {
  await getUsersMeta();
  await db.query(
    `UPDATE users
     SET email_verification_token = NULL,
         verification_expires_at = NULL
     WHERE id = ?`,
    [userId]
  );
}

async function getSafeUserById(userId) {
  const { identityColumn } = await getUsersMeta();
  const [rows] = await db.query(
    `SELECT
      u.id,
      u.${identityColumn} AS name,
      u.email,
      u.email_verified,
      r.name AS role
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

module.exports = {
  getUserByLogin,
  getRoleByName,
  getUserByEmail,
  storePasswordResetToken,
  getUserByPasswordResetToken,
  updatePasswordAndClearResetToken,
  clearPasswordResetToken,
  createRegisteredUser,
  storeVerificationToken,
  getUserByVerificationToken,
  markEmailAsVerified,
  clearVerificationToken,
  getSafeUserById
};
