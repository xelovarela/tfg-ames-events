/**
 * Este archivo define las rutas de administracion de usuarios.
 * Todas quedan restringidas a sesiones autenticadas con rol admin.
 */
const express = require('express');
const usersController = require('../controllers/usersController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.patch('/:id/role', usersController.updateRole);
router.patch('/:id/status', usersController.updateStatus);

module.exports = router;
