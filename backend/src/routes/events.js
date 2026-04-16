/**
 * Este archivo define las rutas REST del recurso eventos.
 * Su unica responsabilidad es asociar cada endpoint HTTP con la accion adecuada
 * del controlador, sin contener logica de negocio propia.
 */
const express = require('express');
const eventsController = require('../controllers/eventsController');
const { requireAuth, requireAdmin, requireAnyRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Se registran las operaciones CRUD disponibles para los eventos.
router.get('/', eventsController.getAll);
router.get('/:id', eventsController.getById);

router.post('/', requireAuth, requireAnyRole(['admin', 'content_manager']), eventsController.create);
router.put('/:id', requireAuth, requireAnyRole(['admin', 'content_manager']), eventsController.update);
router.delete('/:id', requireAuth, requireAdmin, eventsController.remove);
module.exports = router;

