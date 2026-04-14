/**
 * Este archivo define las rutas REST del recurso audiencias.
 * Su funcion es describir la API publica del modulo sin mezclar logica adicional.
 */
const express = require('express');
const audiencesController = require('../controllers/audiencesController');

const router = express.Router();

// Se exponen las operaciones CRUD de audiencias.
router.get('/', audiencesController.getAll);
router.get('/:id', audiencesController.getById);
router.post('/', audiencesController.create);
router.put('/:id', audiencesController.update);
router.delete('/:id', audiencesController.remove);

module.exports = router;
