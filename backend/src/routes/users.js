/**
 * Este archivo define las rutas REST del recurso usuarios.
 * Todas las operaciones quedan restringidas a sesiones autenticadas con rol admin.
 */
const express = require('express');
const usersController = require('../controllers/usersController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', usersController.create);
router.put('/:id', usersController.update);
router.delete('/:id', usersController.remove);

module.exports = router;
