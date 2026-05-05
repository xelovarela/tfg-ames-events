/**
 * Este archivo define las rutas REST del recurso audiencias.
 * Su funcion es describir la API pública del modulo sin mezclar logica adicional.
 */
const express = require('express');
const audiencesController = require('../controllers/audiencesController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Se exponen las operaciones CRUD de audiencias.
router.get('/', audiencesController.getAll);
router.get('/:id', audiencesController.getById);
router.post('/', requireAuth, requireAdmin, audiencesController.create);
router.put('/:id', requireAuth, requireAdmin, audiencesController.update);
router.delete('/:id', requireAuth, requireAdmin, audiencesController.remove);

module.exports = router;
