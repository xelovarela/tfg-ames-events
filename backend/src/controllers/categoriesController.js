/**
 * Este archivo contiene el controlador de categorias.
 * Se encarga de validar los datos de entrada y de coordinar la capa de servicios
 * para responder a las peticiones CRUD relacionadas con las categorias.
 */
const categoriesService = require('../services/categoriesService');
const { toPositiveInt } = require('../utils/validation');

// Limite maximo permitido para el nombre de una categoria.
const MAX_CATEGORY_NAME_LENGTH = 100;

// Valida y normaliza el cuerpo recibido al crear o editar categorias.
function parseCategoryPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > MAX_CATEGORY_NAME_LENGTH) {
    return { error: 'Invalid name. Must be between 1 and 100 characters.' };
  }

  return { name };
}

// Devuelve todas las categorias disponibles.
async function getAll(req, res) {
  try {
    const categories = await categoriesService.listCategories();
    return res.json(categories);
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return res.status(500).json({ error: 'Error retrieving categories from database' });
  }
}

// Busca una categoria concreta a partir del id recibido por ruta.
async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid category id' });
  }

  try {
    const category = await categoriesService.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json(category);
  } catch (error) {
    console.error('Error retrieving category:', error);
    return res.status(500).json({ error: 'Error retrieving category from database' });
  }
}

// Inserta una nueva categoria cuando el nombre es valido.
async function create(req, res) {
  const payload = parseCategoryPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const id = await categoriesService.createCategory(payload.name);
    return res.status(201).json({ message: 'Category created successfully', id });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Error creating category in database' });
  }
}

// Modifica el nombre de una categoria ya existente.
async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid category id' });
  }

  const payload = parseCategoryPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const wasUpdated = await categoriesService.updateCategory(id, payload.name);
    if (!wasUpdated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ error: 'Error updating category in database' });
  }
}

// Elimina una categoria solo si existe y no esta siendo usada por eventos.
async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid category id' });
  }

  try {
    const existingCategory = await categoriesService.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const hasEvents = await categoriesService.hasRelatedEvents(id);
    if (hasEvents) {
      return res.status(409).json({ error: 'Category cannot be deleted because it has related events' });
    }

    await categoriesService.deleteCategory(id);
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ error: 'Error deleting category from database' });
  }
}

// Se exportan las acciones CRUD para el router de categorias.
module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
