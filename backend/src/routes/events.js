const express = require('express');
const eventsController = require('../controllers/eventsController');

const router = express.Router();

router.get('/', eventsController.getAll);
router.get('/:id', eventsController.getById);
router.post('/', eventsController.create);
router.put('/:id', eventsController.update);
router.delete('/:id', eventsController.remove);

module.exports = router;
