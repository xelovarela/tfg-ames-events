const express = require('express');
const alertsController = require('../controllers/alertsController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', alertsController.getAll);
router.post('/', alertsController.create);
router.put('/:id', alertsController.update);
router.patch('/:id/status', alertsController.updateStatus);
router.delete('/:id', alertsController.remove);

module.exports = router;
