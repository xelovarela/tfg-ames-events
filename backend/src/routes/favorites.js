const express = require('express');
const favoritesController = require('../controllers/favoritesController');
const { requireAuth, requireAnyRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, requireAnyRole(['user']));

router.get('/', favoritesController.getMyFavorites);
router.get('/ids', favoritesController.getMyFavoriteIds);
router.post('/:eventId', favoritesController.addFavorite);
router.delete('/:eventId', favoritesController.removeFavorite);

module.exports = router;
