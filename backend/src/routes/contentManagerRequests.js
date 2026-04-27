/**
 * Rutas para solicitar y revisar acceso como gestor de contenido.
 */
const express = require('express');
const controller = require('../controllers/contentManagerRequestsController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/me', controller.listMine);
router.post('/', controller.create);

router.get('/', requireAdmin, controller.listAll);
router.patch('/:id/review', requireAdmin, controller.review);

module.exports = router;
