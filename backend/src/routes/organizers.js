/**
 * Este archivo define las rutas REST del recurso organizadores.
 * Delega el trabajo real en el controlador para mantener una arquitectura por capas.
 */
const express = require('express');
const organizersController = require('../controllers/organizersController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Se exponen las operaciones CRUD de organizadores.
router.get('/', organizersController.getAll);
router.get('/:id', organizersController.getById);
router.post('/', requireAuth, requireAdmin, organizersController.create);
router.put('/:id', requireAuth, requireAdmin, organizersController.update);
router.delete('/:id', requireAuth, requireAdmin, organizersController.remove);

module.exports = router;
