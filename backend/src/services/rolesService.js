/**
 * Este archivo implementa la capa de servicios de roles.
 * Expone consultas simples para listar roles disponibles y verificar
 * la existencia de un role_id antes de crear o editar usuarios.
 */
const db = require('../config/db');

async function listRoles() {
  const [rows] = await db.query('SELECT id, name, description FROM roles ORDER BY id');
  return rows;
}

async function roleExists(roleId) {
  const [rows] = await db.query('SELECT id FROM roles WHERE id = ?', [roleId]);
  return rows.length > 0;
}

async function getRoleByName(roleName) {
  const [rows] = await db.query(
    `SELECT id, name, description
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [roleName]
  );

  return rows[0] || null;
}

module.exports = {
  listRoles,
  roleExists,
  getRoleByName
};
