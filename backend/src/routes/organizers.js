const express = require('express');
const organizersController = require('../controllers/organizersController');

const router = express.Router();

router.get('/', organizersController.getAll);
router.get('/:id', organizersController.getById);
router.post('/', organizersController.create);
router.put('/:id', organizersController.update);
router.delete('/:id', organizersController.remove);

module.exports = router;
