/**
 * Este archivo define las rutas REST del recurso categorías.
 * Mantiene separado el mapeo de endpoints respecto a la validación y el acceso a datos.
 */
const express = require('express');
const categoriesController = require('../controllers/categoriesController');
const { requireAuth, requireAdmin, requireAnyRole } = require('../middleware/authMiddleware');
const { categoryImageUpload } = require('../middleware/eventImageUpload');

const router = express.Router();

// Se exponen las operaciones CRUD de categorías.
router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);
router.post('/', requireAuth, requireAnyRole(['admin', 'content_manager']), categoryImageUpload.single('image'), categoriesController.create);
router.put('/:id', requireAuth, requireAnyRole(['admin', 'content_manager']), categoryImageUpload.single('image'), categoriesController.update);
router.delete('/:id', requireAuth, requireAdmin, categoriesController.remove);

module.exports = router;
