const categoriesService = require('../services/categoriesService');
const { toPositiveInt } = require('../utils/validation');

const MAX_CATEGORY_NAME_LENGTH = 100;

function parseCategoryPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > MAX_CATEGORY_NAME_LENGTH) {
    return { error: 'Invalid name. Must be between 1 and 100 characters.' };
  }

  return { name };
}

async function getAll(req, res) {
  try {
    const categories = await categoriesService.listCategories();
    return res.json(categories);
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return res.status(500).json({ error: 'Error retrieving categories from database' });
  }
}

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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
