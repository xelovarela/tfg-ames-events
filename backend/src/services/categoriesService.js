const db = require('../config/db');

async function listCategories() {
  const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name');
  return rows;
}

async function getCategoryById(id) {
  const [rows] = await db.query('SELECT id, name FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createCategory(name) {
  const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result.insertId;
}

async function updateCategory(id, name) {
  const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows > 0;
}

async function deleteCategory(id) {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE category_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  hasRelatedEvents
};
