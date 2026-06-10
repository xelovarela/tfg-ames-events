/**
 * Este archivo define las rutas REST del recurso ubicaciones.
 * Enlaza cada método HTTP con la acción correspondiente del controlador.
 */
const express = require('express');
const locationsController = require('../controllers/locationsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Se exponen las operaciones CRUD de ubicaciones.
router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);
router.post('/', requireAuth, requireAdmin, locationsController.create);
router.put('/:id', requireAuth, requireAdmin, locationsController.update);
router.delete('/:id', requireAuth, requireAdmin, locationsController.remove);

module.exports = router;
