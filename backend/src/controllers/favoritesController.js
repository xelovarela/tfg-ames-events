const favoritesService = require('../services/favoritesService');
const { toPositiveIntParam } = require('../utils/validation');

async function getMyFavorites(req, res) {
  try {
    const favorites = await favoritesService.listFavoritesByUserId(req.user.id);
    return res.json(favorites);
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return res.status(500).json({ error: 'Error retrieving favorites from database' });
  }
}

async function getMyFavoriteIds(req, res) {
  try {
    const favoriteIds = await favoritesService.listFavoriteIdsByUserId(req.user.id);
    return res.json({ event_ids: favoriteIds });
  } catch (error) {
    console.error('Error retrieving favorite ids:', error);
    return res.status(500).json({ error: 'Error retrieving favorite ids from database' });
  }
}

async function addFavorite(req, res) {
  const eventId = toPositiveIntParam(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    const exists = await favoritesService.eventExists(eventId);
    if (!exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await favoritesService.addFavorite(req.user.id, eventId);
    return res.status(201).json({ message: 'Favorite saved successfully' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return res.status(500).json({ error: 'Error saving favorite in database' });
  }
}

async function removeFavorite(req, res) {
  const eventId = toPositiveIntParam(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    await favoritesService.removeFavorite(req.user.id, eventId);
    return res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return res.status(500).json({ error: 'Error removing favorite from database' });
  }
}

module.exports = {
  getMyFavorites,
  getMyFavoriteIds,
  addFavorite,
  removeFavorite
};
