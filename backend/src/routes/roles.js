/**
 * Este archivo define las rutas REST del recurso roles.
 * Se protegen con auth de administrador porque se usan en panel de gestion.
 */
const express = require('express');
const rolesController = require('../controllers/rolesController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/', rolesController.getAll);

module.exports = router;
