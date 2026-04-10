const express = require('express');
const audiencesController = require('../controllers/audiencesController');

const router = express.Router();

router.get('/', audiencesController.getAll);
router.get('/:id', audiencesController.getById);
router.post('/', audiencesController.create);
router.put('/:id', audiencesController.update);
router.delete('/:id', audiencesController.remove);

module.exports = router;
