/**
 * Este archivo implementa la capa de servicios de categorías.
 * Reune las consultas SQL relacionadas con el catálogo de categorías y sus dependencias.
 */
const db = require('../config/db');

// Devuelve todas las categorías ordenadas alfabeticamente.
async function listCategories() {
  const [rows] = await db.query('SELECT id, name, image_url FROM categories ORDER BY name');
  return rows;
}

// Recupera una categoría por su identificador.
async function getCategoryById(id) {
  const [rows] = await db.query('SELECT id, name, image_url FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

// Inserta una nueva categoría y devuelve su id generado.
async function createCategory({ name, imageUrl }) {
  const [result] = await db.query(
    'INSERT INTO categories (name, image_url) VALUES (?, ?)',
    [name, imageUrl]
  );
  return result.insertId;
}

// Actualiza el nombre de una categoría existente.
async function updateCategory(id, { name, imageUrl }) {
  const [result] = await db.query(
    'UPDATE categories SET name = ?, image_url = ? WHERE id = ?',
    [name, imageUrl, id]
  );
  return result.affectedRows > 0;
}

// Elimina una categoría concreta.
async function deleteCategory(id) {
  const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Comprueba si hay eventos que impiden borrar la categoría.
async function hasRelatedEvents(id) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS total FROM events WHERE category_id = ?',
    [id]
  );
  return rows[0].total > 0;
}

// Se exportan las operaciones de acceso a datos del modulo.
module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  hasRelatedEvents
};
