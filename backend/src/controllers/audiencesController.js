const audiencesService = require('../services/audiencesService');
const { toPositiveInt } = require('../utils/validation');

const MAX_AUDIENCE_NAME_LENGTH = 100;

function toNullableNonNegativeInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseAudiencePayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const ageMin = toNullableNonNegativeInt(body.age_min);
  const ageMax = toNullableNonNegativeInt(body.age_max);

  if (!name || name.length > MAX_AUDIENCE_NAME_LENGTH) {
    return { error: 'Invalid name. Must be between 1 and 100 characters.' };
  }

  if (body.age_min !== null && body.age_min !== undefined && body.age_min !== '' && ageMin === null) {
    return { error: 'age_min must be a non-negative integer when provided.' };
  }

  if (body.age_max !== null && body.age_max !== undefined && body.age_max !== '' && ageMax === null) {
    return { error: 'age_max must be a non-negative integer when provided.' };
  }

  if ((ageMin !== null && ageMax === null) || (ageMin === null && ageMax !== null)) {
    return { error: 'age_min and age_max must be provided together.' };
  }

  if (ageMin !== null && ageMax !== null && ageMin > ageMax) {
    return { error: 'age_min cannot be greater than age_max.' };
  }

  return { name, ageMin, ageMax };
}

async function getAll(req, res) {
  try {
    const audiences = await audiencesService.listAudiences();
    return res.json(audiences);
  } catch (error) {
    console.error('Error retrieving audiences:', error);
    return res.status(500).json({ error: 'Error retrieving audiences from database' });
  }
}

async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

  try {
    const audience = await audiencesService.getAudienceById(id);
    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    return res.json(audience);
  } catch (error) {
    console.error('Error retrieving audience:', error);
    return res.status(500).json({ error: 'Error retrieving audience from database' });
  }
}

async function create(req, res) {
  const payload = parseAudiencePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const id = await audiencesService.createAudience(payload);
    return res.status(201).json({ message: 'Audience created successfully', id });
  } catch (error) {
    console.error('Error creating audience:', error);
    return res.status(500).json({ error: 'Error creating audience in database' });
  }
}

async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

  const payload = parseAudiencePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const wasUpdated = await audiencesService.updateAudience(id, payload);
    if (!wasUpdated) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    return res.json({ message: 'Audience updated successfully' });
  } catch (error) {
    console.error('Error updating audience:', error);
    return res.status(500).json({ error: 'Error updating audience in database' });
  }
}

async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

  try {
    const existingAudience = await audiencesService.getAudienceById(id);
    if (!existingAudience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    const hasEvents = await audiencesService.hasRelatedEvents(id);
    if (hasEvents) {
      return res.status(409).json({ error: 'Audience cannot be deleted because it has related events' });
    }

    await audiencesService.deleteAudience(id);
    return res.json({ message: 'Audience deleted successfully' });
  } catch (error) {
    console.error('Error deleting audience:', error);
    return res.status(500).json({ error: 'Error deleting audience from database' });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
