const locationsService = require('../services/locationsService');
const { toPositiveInt, toLatitude, toLongitude } = require('../utils/validation');

const MAX_LOCATION_NAME_LENGTH = 150;

function parseLocationPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const lat = toLatitude(body.lat);
  const lng = toLongitude(body.lng);

  if (!name || name.length > MAX_LOCATION_NAME_LENGTH) {
    return { error: 'Invalid name. Must be between 1 and 150 characters.' };
  }

  if (lat === null || lng === null) {
    return { error: 'Invalid coordinates. lat must be [-90,90], lng must be [-180,180].' };
  }

  return { name, lat, lng };
}

async function getAll(req, res) {
  try {
    const locations = await locationsService.listLocations();
    return res.json(locations);
  } catch (error) {
    console.error('Error retrieving locations:', error);
    return res.status(500).json({ error: 'Error retrieving locations from database' });
  }
}

async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid location id' });
  }

  try {
    const location = await locationsService.getLocationById(id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    return res.json(location);
  } catch (error) {
    console.error('Error retrieving location:', error);
    return res.status(500).json({ error: 'Error retrieving location from database' });
  }
}

async function create(req, res) {
  const payload = parseLocationPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const id = await locationsService.createLocation(payload);
    return res.status(201).json({ message: 'Location created successfully', id });
  } catch (error) {
    console.error('Error creating location:', error);
    return res.status(500).json({ error: 'Error creating location in database' });
  }
}

async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid location id' });
  }

  const payload = parseLocationPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const wasUpdated = await locationsService.updateLocation(id, payload);
    if (!wasUpdated) {
      return res.status(404).json({ error: 'Location not found' });
    }
    return res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ error: 'Error updating location in database' });
  }
}

async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid location id' });
  }

  try {
    const existingLocation = await locationsService.getLocationById(id);
    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const hasEvents = await locationsService.hasRelatedEvents(id);
    if (hasEvents) {
      return res.status(409).json({ error: 'Location cannot be deleted because it has related events' });
    }

    await locationsService.deleteLocation(id);
    return res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return res.status(500).json({ error: 'Error deleting location from database' });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
