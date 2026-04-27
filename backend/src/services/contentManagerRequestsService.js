/**
 * Servicio de solicitudes para pasar de usuario a gestor de contenido.
 * Crea solicitudes, permite listarlas y gestiona su revision por administracion.
 */
const db = require('../config/db');

const TABLE_NAME = 'content_manager_requests';

let ensureTablePromise = null;

async function ensureRequestsTable() {
  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      await db.query(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNSIGNED NOT NULL,
          phone VARCHAR(30) NULL,
          organization_name VARCHAR(150) NULL,
          proposal_title VARCHAR(150) NOT NULL,
          proposal_description TEXT NOT NULL,
          status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
          admin_notes VARCHAR(500) NULL,
          reviewed_by INT UNSIGNED NULL,
          reviewed_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_content_manager_requests_user_id (user_id),
          INDEX idx_content_manager_requests_status (status),
          CONSTRAINT fk_content_manager_requests_user
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
          CONSTRAINT fk_content_manager_requests_reviewer
            FOREIGN KEY (reviewed_by) REFERENCES users(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        )`
      );
    })().catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }

  return ensureTablePromise;
}

function normalizeRequest(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    organization_name: row.organization_name,
    proposal_title: row.proposal_title,
    proposal_description: row.proposal_description,
    status: row.status,
    admin_notes: row.admin_notes,
    reviewed_by: row.reviewed_by,
    reviewed_by_username: row.reviewed_by_username,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getPendingRequestByUserId(userId) {
  await ensureRequestsTable();

  const [rows] = await db.query(
    `SELECT id, user_id, status
     FROM ${TABLE_NAME}
     WHERE user_id = ?
       AND status = 'pending'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

async function createRequest({
  userId,
  phone,
  organizationName,
  proposalTitle,
  proposalDescription
}) {
  await ensureRequestsTable();

  const [result] = await db.query(
    `INSERT INTO ${TABLE_NAME} (
      user_id,
      phone,
      organization_name,
      proposal_title,
      proposal_description
    ) VALUES (?, ?, ?, ?, ?)`,
    [userId, phone, organizationName, proposalTitle, proposalDescription]
  );

  return result.insertId;
}

async function listRequestsByUserId(userId) {
  await ensureRequestsTable();

  const [rows] = await db.query(
    `SELECT
      r.id,
      r.user_id,
      u.username,
      u.email,
      r.phone,
      r.organization_name,
      r.proposal_title,
      r.proposal_description,
      r.status,
      r.admin_notes,
      r.reviewed_by,
      reviewer.username AS reviewed_by_username,
      r.reviewed_at,
      r.created_at,
      r.updated_at
     FROM ${TABLE_NAME} r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC, r.id DESC`,
    [userId]
  );

  return rows.map(normalizeRequest);
}

async function listRequests(status) {
  await ensureRequestsTable();

  const values = [];
  let whereSql = '';
  if (status) {
    whereSql = 'WHERE r.status = ?';
    values.push(status);
  }

  const [rows] = await db.query(
    `SELECT
      r.id,
      r.user_id,
      u.username,
      u.email,
      r.phone,
      r.organization_name,
      r.proposal_title,
      r.proposal_description,
      r.status,
      r.admin_notes,
      r.reviewed_by,
      reviewer.username AS reviewed_by_username,
      r.reviewed_at,
      r.created_at,
      r.updated_at
     FROM ${TABLE_NAME} r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
     ${whereSql}
     ORDER BY
       CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
       r.created_at DESC,
       r.id DESC`,
    values
  );

  return rows.map(normalizeRequest);
}

async function reviewRequest({ requestId, nextStatus, adminNotes, reviewerId, contentManagerRoleId }) {
  await ensureRequestsTable();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT id, user_id, status
       FROM ${TABLE_NAME}
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [requestId]
    );

    const current = rows[0];
    if (!current) {
      await connection.rollback();
      return { notFound: true };
    }

    if (current.status !== 'pending') {
      await connection.rollback();
      return { alreadyReviewed: true, status: current.status };
    }

    await connection.query(
      `UPDATE ${TABLE_NAME}
       SET status = ?,
           admin_notes = ?,
           reviewed_by = ?,
           reviewed_at = NOW()
       WHERE id = ?`,
      [nextStatus, adminNotes, reviewerId, requestId]
    );

    if (nextStatus === 'approved') {
      await connection.query(
        `UPDATE users
         SET role_id = ?
         WHERE id = ?`,
        [contentManagerRoleId, current.user_id]
      );
    }

    await connection.commit();

    const [updatedRows] = await db.query(
      `SELECT
        r.id,
        r.user_id,
        u.username,
        u.email,
        r.phone,
        r.organization_name,
        r.proposal_title,
        r.proposal_description,
        r.status,
        r.admin_notes,
        r.reviewed_by,
        reviewer.username AS reviewed_by_username,
        r.reviewed_at,
        r.created_at,
        r.updated_at
       FROM ${TABLE_NAME} r
       JOIN users u ON u.id = r.user_id
       LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
       WHERE r.id = ?
       LIMIT 1`,
      [requestId]
    );

    return { request: normalizeRequest(updatedRows[0]) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getPendingRequestByUserId,
  createRequest,
  listRequestsByUserId,
  listRequests,
  reviewRequest
};
