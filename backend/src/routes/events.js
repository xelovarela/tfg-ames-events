/**
 * Este archivo define las rutas REST del recurso eventos.
 * Su unica responsabilidad es asociar cada endpoint HTTP con la accion adecuada
 * del controlador, sin contener logica de negocio propia.
 */
const express = require('express');
const eventsController = require('../controllers/eventsController');

const router = express.Router();

// Se registran las operaciones CRUD disponibles para los eventos.
router.get('/', eventsController.getAll);
router.get('/:id', eventsController.getById);
router.post('/', eventsController.create);
router.put('/:id', eventsController.update);
router.delete('/:id', eventsController.remove);

module.exports = router;
