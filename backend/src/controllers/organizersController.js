const organizersService = require('../services/organizersService');
const { toPositiveInt } = require('../utils/validation');

const MAX_ORGANIZER_NAME_LENGTH = 100;
const MAX_ORGANIZER_EMAIL_LENGTH = 100;
const MAX_ORGANIZER_PHONE_LENGTH = 30;

function parseOrganizerPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const emailValue = typeof body.email === 'string' ? body.email.trim() : '';
  const phoneValue = typeof body.phone === 'string' ? body.phone.trim() : '';
  const email = emailValue === '' ? null : emailValue;
  const phone = phoneValue === '' ? null : phoneValue;

  if (!name || name.length > MAX_ORGANIZER_NAME_LENGTH) {
    return { error: 'Invalid name. Must be between 1 and 100 characters.' };
  }

  if (email !== null && email.length > MAX_ORGANIZER_EMAIL_LENGTH) {
    return { error: 'email must have at most 100 characters.' };
  }

  if (phone !== null && phone.length > MAX_ORGANIZER_PHONE_LENGTH) {
    return { error: 'phone must have at most 30 characters.' };
  }

  return { name, email, phone };
}

async function getAll(req, res) {
  try {
    const organizers = await organizersService.listOrganizers();
    return res.json(organizers);
  } catch (error) {
    console.error('Error retrieving organizers:', error);
    return res.status(500).json({ error: 'Error retrieving organizers from database' });
  }
}

async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

  try {
    const organizer = await organizersService.getOrganizerById(id);
    if (!organizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }

    return res.json(organizer);
  } catch (error) {
    console.error('Error retrieving organizer:', error);
    return res.status(500).json({ error: 'Error retrieving organizer from database' });
  }
}

async function create(req, res) {
  const payload = parseOrganizerPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const id = await organizersService.createOrganizer(payload);
    return res.status(201).json({ message: 'Organizer created successfully', id });
  } catch (error) {
    console.error('Error creating organizer:', error);
    return res.status(500).json({ error: 'Error creating organizer in database' });
  }
}

async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

  const payload = parseOrganizerPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const wasUpdated = await organizersService.updateOrganizer(id, payload);
    if (!wasUpdated) {
      return res.status(404).json({ error: 'Organizer not found' });
    }

    return res.json({ message: 'Organizer updated successfully' });
  } catch (error) {
    console.error('Error updating organizer:', error);
    return res.status(500).json({ error: 'Error updating organizer in database' });
  }
}

async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

  try {
    const existingOrganizer = await organizersService.getOrganizerById(id);
    if (!existingOrganizer) {
      return res.status(404).json({ error: 'Organizer not found' });
    }

    const hasEvents = await organizersService.hasRelatedEvents(id);
    if (hasEvents) {
      return res.status(409).json({ error: 'Organizer cannot be deleted because it has related events' });
    }

    await organizersService.deleteOrganizer(id);
    return res.json({ message: 'Organizer deleted successfully' });
  } catch (error) {
    console.error('Error deleting organizer:', error);
    return res.status(500).json({ error: 'Error deleting organizer from database' });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
