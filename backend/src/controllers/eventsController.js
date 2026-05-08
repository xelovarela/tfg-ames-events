/**
 * Este archivo contiene el controlador de eventos.
 * Recibe las peticiones HTTP, valida y normaliza los datos de entrada, coordina
 * las comprobaciones necesarias y devuelve respuestas HTTP coherentes al cliente.
 */
const eventsService = require('../services/eventsService');
const alertsService = require('../services/alertsService');
const {
  saveUploadedEventImage,
  deleteEventImageFile
} = require('../middleware/eventImageUpload');
const { toPositiveInt } = require('../utils/validation');
const { parseEventPayload } = require('../utils/eventPayloadValidation');
const {
  TIME_SCOPES,
  canUsePrivilegedTimeScope,
  normalizeTimeScope
} = require('../utils/eventTime');

// Devuelve la lista completa de eventos para el frontend.
async function getAll(req, res) {
  try {
    const requestedTimeScope = normalizeTimeScope(req.query.timeScope, TIME_SCOPES.UPCOMING);
    const timeScope = canUsePrivilegedTimeScope(req.user) ? requestedTimeScope : TIME_SCOPES.UPCOMING;
    const events = await eventsService.listEvents({ timeScope });
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

// Crea un nuevo evento después de validar datos y comprobar relaciones existentes.
async function create(req, res) {
  const payload = parseEventPayload(req.body, { rejectPastDate: true });
  let uploadedImageUrl = null;

  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    uploadedImageUrl = await saveUploadedEventImage(req.file);
    payload.imageUrl = uploadedImageUrl || payload.imageUrl;

    const [hasCategory, hasLocation, hasAudience, hasOrganizer] = await Promise.all([
      eventsService.categoryExists(payload.categoryId),
      eventsService.locationExists(payload.locationId),
      payload.audienceId ? eventsService.audienceExists(payload.audienceId) : Promise.resolve(true),
      payload.organizerId ? eventsService.organizerExists(payload.organizerId) : Promise.resolve(true)
    ]);

    if (!hasCategory) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'category_id does not exist' });
    }

    if (!hasLocation) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'location_id does not exist' });
    }

    if (!hasAudience) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'audience_id does not exist' });
    }

    if (!hasOrganizer) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'organizer_id does not exist' });
    }

    const id = await eventsService.createEvent(payload);
    const event = await eventsService.getEventById(id);

    try {
      await alertsService.notifyMatchingAlertsForEvent(event);
    } catch (alertError) {
      console.error('Error processing event alerts:', alertError);
    }

    return res.status(201).json({ message: 'Event created successfully', id });
  } catch (error) {
    deleteEventImageFile(uploadedImageUrl);
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Error creating event in database' });
  }
}

// Actualiza un evento existente manteniendo las mismas reglas de validación que en alta.
async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  let uploadedImageUrl = null;

  if (!id) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  const payload = parseEventPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    uploadedImageUrl = await saveUploadedEventImage(req.file);

    const [existingEvent, hasCategory, hasLocation, hasAudience, hasOrganizer] = await Promise.all([
      eventsService.getEventById(id),
      eventsService.categoryExists(payload.categoryId),
      eventsService.locationExists(payload.locationId),
      payload.audienceId ? eventsService.audienceExists(payload.audienceId) : Promise.resolve(true),
      payload.organizerId ? eventsService.organizerExists(payload.organizerId) : Promise.resolve(true)
    ]);

    if (!existingEvent) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(404).json({ error: 'Event not found' });
    }

    const shouldRemoveImage = toBooleanFlag(req.body.remove_image) === 1;
    payload.imageUrl = shouldRemoveImage
      ? null
      : uploadedImageUrl || existingEvent.image_url || null;

    if (!hasCategory) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'category_id does not exist' });
    }

    if (!hasLocation) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'location_id does not exist' });
    }

    if (!hasAudience) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'audience_id does not exist' });
    }

    if (!hasOrganizer) {
      deleteEventImageFile(uploadedImageUrl);
      return res.status(400).json({ error: 'organizer_id does not exist' });
    }

    await eventsService.updateEvent(id, payload);
    if ((shouldRemoveImage || uploadedImageUrl) && existingEvent.image_url !== uploadedImageUrl) {
      deleteEventImageFile(existingEvent.image_url);
    }
    return res.json({ message: 'Event updated successfully' });
  } catch (error) {
    deleteEventImageFile(uploadedImageUrl);
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
    const existingEvent = await eventsService.getEventById(id);
    const wasDeleted = await eventsService.deleteEvent(id);
    if (!wasDeleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    deleteEventImageFile(existingEvent?.image_url);
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
