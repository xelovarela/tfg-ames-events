const favoritesService = require('../services/favoritesService');
const { toPositiveIntParam } = require('../utils/validation');

async function getMyFavorites(req, res) {
  const favorites = await favoritesService.listFavoritesByUserId(req.user.id);
  return res.json(favorites);
}

async function getMyFavoriteIds(req, res) {
  const favoriteIds = await favoritesService.listFavoriteIdsByUserId(req.user.id);
  return res.json({ event_ids: favoriteIds });
}

async function addFavorite(req, res) {
  const eventId = toPositiveIntParam(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  const exists = await favoritesService.eventExists(eventId);
  if (!exists) {
    return res.status(404).json({ error: 'Event not found' });
  }

  await favoritesService.addFavorite(req.user.id, eventId);
  return res.status(201).json({ message: 'Favorite saved successfully' });
}

async function removeFavorite(req, res) {
  const eventId = toPositiveIntParam(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  await favoritesService.removeFavorite(req.user.id, eventId);
  return res.json({ message: 'Favorite removed successfully' });
}

module.exports = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite
};
