/**
 * Este archivo define las rutas REST del recurso categorias.
 * Mantiene separado el mapeo de endpoints respecto a la validacion y el acceso a datos.
 */
const express = require('express');
const categoriesController = require('../controllers/categoriesController');

const router = express.Router();

// Se exponen las operaciones CRUD de categorias.
router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);
router.post('/', categoriesController.create);
router.put('/:id', categoriesController.update);
router.delete('/:id', categoriesController.remove);

module.exports = router;
