/**
 * Controlador de alertas del usuario autenticado.
 * Valida filtros simples y delega la persistencia al servicio de alertas.
 */
const alertsService = require('../services/alertsService');
const {
  toBooleanFlag,
  toNullablePositiveInt,
  toPositiveIntParam
} = require('../utils/validation');

const MAX_ALERT_NAME_LENGTH = 100;
const MAX_KEYWORD_LENGTH = 150;
const ALLOWED_LOCALITIES = ['Bertamiráns', 'Milladoiro', 'Otras parroquias'];

function hasRawValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function parseAlertPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const categoryId = toNullablePositiveInt(body.category_id);
  const locationId = toNullablePositiveInt(body.location_id);
  const locality = typeof body.locality === 'string' ? body.locality.trim() : '';
  const audienceId = toNullablePositiveInt(body.audience_id);
  const keyword = typeof body.keyword === 'string' ? body.keyword.trim() : '';
  const isActive = body.is_active === undefined ? 1 : toBooleanFlag(body.is_active);

  if (!name || name.length > MAX_ALERT_NAME_LENGTH) {
    return { error: 'Alert name is required and must be at most 100 characters.' };
  }

  if (hasRawValue(body.category_id) && !categoryId) {
    return { error: 'category_id must be a positive integer when provided.' };
  }

  if (hasRawValue(body.location_id) && !locationId) {
    return { error: 'location_id must be a positive integer when provided.' };
  }

  if (locality && !ALLOWED_LOCALITIES.includes(locality)) {
    return { error: 'locality must be one of: Bertamiráns, Milladoiro, Otras parroquias.' };
  }

  if (hasRawValue(body.audience_id) && !audienceId) {
    return { error: 'audience_id must be a positive integer when provided.' };
  }

  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return { error: 'keyword must be at most 150 characters.' };
  }

  if (isActive === null) {
    return { error: 'is_active must be a boolean value.' };
  }

  const hasCriteria = Boolean(
    categoryId ||
    locationId ||
    locality ||
    audienceId ||
    keyword
  );
  if (!hasCriteria) {
    return { error: 'At least one alert criterion is required.' };
  }

  return {
    name,
    categoryId,
    locationId,
    locality: locality || null,
    audienceId,
    keyword: keyword || null,
    isActive: isActive === 1
  };
}

async function validateRelations(payload) {
  const [hasCategory, hasLocation, hasAudience] = await Promise.all([
    payload.categoryId ? alertsService.categoryExists(payload.categoryId) : Promise.resolve(true),
    payload.locationId ? alertsService.locationExists(payload.locationId) : Promise.resolve(true),
    payload.audienceId ? alertsService.audienceExists(payload.audienceId) : Promise.resolve(true)
  ]);

  if (!hasCategory) {
    return 'category_id does not exist';
  }

  if (!hasLocation) {
    return 'location_id does not exist';
  }

  if (!hasAudience) {
    return 'audience_id does not exist';
  }

  return null;
}

async function getAll(req, res) {
  const alerts = await alertsService.listAlertsByUserId(req.user.id);
  return res.json(alerts);
}

async function create(req, res) {
  const payload = parseAlertPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const relationError = await validateRelations(payload);
  if (relationError) {
    return res.status(400).json({ error: relationError });
  }

  const id = await alertsService.createAlert(req.user.id, payload);
  return res.status(201).json({ message: 'Alert created successfully', id });
}

async function update(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }

  const payload = parseAlertPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const relationError = await validateRelations(payload);
  if (relationError) {
    return res.status(400).json({ error: relationError });
  }

  const wasUpdated = await alertsService.updateAlert(id, req.user.id, payload);
  if (!wasUpdated) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json({ message: 'Alert updated successfully' });
}

async function updateStatus(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }

  const isActive = toBooleanFlag(req.body.is_active);
  if (isActive === null) {
    return res.status(400).json({ error: 'is_active is required and must be boolean.' });
  }

  const wasUpdated = await alertsService.updateAlertStatus(id, req.user.id, isActive === 1);
  if (!wasUpdated) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json({ message: 'Alert status updated successfully' });
}

async function remove(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }

  const wasDeleted = await alertsService.deleteAlert(id, req.user.id);
  if (!wasDeleted) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.json({ message: 'Alert deleted successfully' });
}

module.exports = {
  getAll,
  create,
  update,
  updateStatus,
  remove
};
