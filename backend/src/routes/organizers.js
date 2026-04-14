/**
 * Este archivo define las rutas REST del recurso organizadores.
 * Delega el trabajo real en el controlador para mantener una arquitectura por capas.
 */
const express = require('express');
const organizersController = require('../controllers/organizersController');

const router = express.Router();

// Se exponen las operaciones CRUD de organizadores.
router.get('/', organizersController.getAll);
router.get('/:id', organizersController.getById);
router.post('/', organizersController.create);
router.put('/:id', organizersController.update);
router.delete('/:id', organizersController.remove);

module.exports = router;
