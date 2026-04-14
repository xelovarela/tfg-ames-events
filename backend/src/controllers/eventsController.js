/**
 * Este archivo contiene el controlador de eventos.
 * Recibe las peticiones HTTP, valida y normaliza los datos de entrada, coordina
 * las comprobaciones necesarias y devuelve respuestas HTTP coherentes al cliente.
 */
const eventsService = require('../services/eventsService');
const {
  toPositiveInt,
  toNullablePositiveInt,
  toNullableDate,
  toBooleanFlag,
  toNullableMoney
} = require('../utils/validation');

// Estas constantes definen los limites aceptados para los campos de texto.
const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 2000;

// Esta funcion transforma y valida el cuerpo recibido antes de crear o actualizar un evento.
function parseEventPayload(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const categoryId = toPositiveInt(body.category_id);
  const locationId = toPositiveInt(body.location_id);
  const audienceId = toNullablePositiveInt(body.audience_id);
  const organizerId = toNullablePositiveInt(body.organizer_id);
  const parsedDate = toNullableDate(body.event_date);
  const isFree = toBooleanFlag(body.is_free);
  let price = toNullableMoney(body.price);
  const minAge = toNullablePositiveInt(body.min_age);
  const maxAge = toNullablePositiveInt(body.max_age);

  if (!title || title.length > MAX_TITLE_LENGTH) {
    return { error: 'Invalid title. Must be between 1 and 150 characters.' };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Invalid description. Maximum length is 2000 characters.' };
  }

  if (!categoryId || !locationId) {
    return { error: 'category_id and location_id must be positive integers.' };
  }

  if (body.audience_id !== null && body.audience_id !== undefined && body.audience_id !== '' && !audienceId) {
    return { error: 'audience_id must be a positive integer when provided.' };
  }

  if (body.organizer_id !== null && body.organizer_id !== undefined && body.organizer_id !== '' && !organizerId) {
    return { error: 'organizer_id must be a positive integer when provided.' };
  }

  if (isFree === null) {
    return { error: 'is_free must be a boolean value (true/false or 1/0).' };
  }

  if (body.event_date !== null && body.event_date !== undefined && body.event_date !== '' && !parsedDate) {
    return { error: 'event_date has an invalid format.' };
  }

  if (isFree === 1) {
    price = null;
  }

  if (isFree === 0 && (price === null || price <= 0)) {
    return { error: 'price must be greater than 0 when is_free is false.' };
  }

  if ((minAge !== null && maxAge === null) || (minAge === null && maxAge !== null)) {
    return { error: 'min_age and max_age must be provided together.' };
  }

  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    return { error: 'min_age cannot be greater than max_age.' };
  }

  return {
    title,
    description: description || null,
    categoryId,
    locationId,
    audienceId,
    organizerId,
    eventDate: parsedDate ? parsedDate.toISOString().slice(0, 19).replace('T', ' ') : null,
    isFree,
    price,
    minAge,
    maxAge
  };
}

// Devuelve la lista completa de eventos para el frontend.
async function getAll(req, res) {
  try {
    const events = await eventsService.listEvents();
    return res.json(events);
  } catch (error) {
    console.error('Error retrieving events:', error);
    return res.status(500).json({ error: 'Error retrieving events from database' });
  }
}

// Recupera un evento concreto validando antes el identificador recibido por URL.
async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    const event = await eventsService.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json(event);
  } catch (error) {
    console.error('Error retrieving event:', error);
    return res.status(500).json({ error: 'Error retrieving event from database' });
  }
}

// Crea un nuevo evento despues de validar datos y comprobar relaciones existentes.
async function create(req, res) {
  const payload = parseEventPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const [hasCategory, hasLocation, hasAudience, hasOrganizer] = await Promise.all([
      eventsService.categoryExists(payload.categoryId),
      eventsService.locationExists(payload.locationId),
      payload.audienceId ? eventsService.audienceExists(payload.audienceId) : Promise.resolve(true),
      payload.organizerId ? eventsService.organizerExists(payload.organizerId) : Promise.resolve(true)
    ]);

    if (!hasCategory) {
      return res.status(400).json({ error: 'category_id does not exist' });
    }

    if (!hasLocation) {
      return res.status(400).json({ error: 'location_id does not exist' });
    }

    if (!hasAudience) {
      return res.status(400).json({ error: 'audience_id does not exist' });
    }

    if (!hasOrganizer) {
      return res.status(400).json({ error: 'organizer_id does not exist' });
    }

    const id = await eventsService.createEvent(payload);
    return res.status(201).json({ message: 'Event created successfully', id });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Error creating event in database' });
  }
}

// Actualiza un evento existente manteniendo las mismas reglas de validacion que en alta.
async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  const payload = parseEventPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const [existingEvent, hasCategory, hasLocation, hasAudience, hasOrganizer] = await Promise.all([
      eventsService.getEventById(id),
      eventsService.categoryExists(payload.categoryId),
      eventsService.locationExists(payload.locationId),
      payload.audienceId ? eventsService.audienceExists(payload.audienceId) : Promise.resolve(true),
      payload.organizerId ? eventsService.organizerExists(payload.organizerId) : Promise.resolve(true)
    ]);

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!hasCategory) {
      return res.status(400).json({ error: 'category_id does not exist' });
    }

    if (!hasLocation) {
      return res.status(400).json({ error: 'location_id does not exist' });
    }

    if (!hasAudience) {
      return res.status(400).json({ error: 'audience_id does not exist' });
    }

    if (!hasOrganizer) {
      return res.status(400).json({ error: 'organizer_id does not exist' });
    }

    await eventsService.updateEvent(id, payload);
    return res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Error updating event in database' });
  }
}

// Elimina un evento si el identificador es valido y el registro existe.
async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  try {
    const wasDeleted = await eventsService.deleteEvent(id);
    if (!wasDeleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Error deleting event from database' });
  }
}

// Se exportan las acciones para que el router pueda asociarlas a cada endpoint.
module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
