/**
 * Este archivo define las rutas REST del recurso ubicaciones.
 * Enlaza cada metodo HTTP con la accion correspondiente del controlador.
 */
const express = require('express');
const locationsController = require('../controllers/locationsController');

const router = express.Router();

// Se exponen las operaciones CRUD de ubicaciones.
router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);
router.post('/', locationsController.create);
router.put('/:id', locationsController.update);
router.delete('/:id', locationsController.remove);

module.exports = router;
