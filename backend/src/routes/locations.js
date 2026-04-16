/**
 * Este archivo define las rutas REST del recurso ubicaciones.
 * Enlaza cada metodo HTTP con la accion correspondiente del controlador.
 */
const express = require('express');
const locationsController = require('../controllers/locationsController');
const { requireAuth, requireAdmin, requireAnyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Se exponen las operaciones CRUD de ubicaciones.
router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);
router.post('/', requireAuth, requireAnyRole(['admin', 'content_manager']), locationsController.create);
router.put('/:id', requireAuth, requireAnyRole(['admin', 'content_manager']), locationsController.update);
router.delete('/:id', requireAuth, requireAdmin, locationsController.remove);

module.exports = router;
