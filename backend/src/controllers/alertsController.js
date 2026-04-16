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

function hasRawValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function parseAlertPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const categoryId = toNullablePositiveInt(body.category_id);
  const locationId = toNullablePositiveInt(body.location_id);
  const audienceId = toNullablePositiveInt(body.audience_id);
  const minAge = toNullablePositiveInt(body.min_age);
  const maxAge = toNullablePositiveInt(body.max_age);
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

  if (hasRawValue(body.audience_id) && !audienceId) {
    return { error: 'audience_id must be a positive integer when provided.' };
  }

  if (hasRawValue(body.min_age) && !minAge) {
    return { error: 'min_age must be a positive integer when provided.' };
  }

  if (hasRawValue(body.max_age) && !maxAge) {
    return { error: 'max_age must be a positive integer when provided.' };
  }

  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    return { error: 'min_age cannot be greater than max_age.' };
  }

  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return { error: 'keyword must be at most 150 characters.' };
  }

  if (isActive === null) {
    return { error: 'is_active must be a boolean value.' };
  }

  const hasCriteria = Boolean(categoryId || locationId || audienceId || minAge || maxAge || keyword);
  if (!hasCriteria) {
    return { error: 'At least one alert criterion is required.' };
  }

  return {
    name,
    categoryId,
    locationId,
    audienceId,
    minAge,
    maxAge,
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
  try {
    const alerts = await alertsService.listAlertsByUserId(req.user.id);
    return res.json(alerts);
  } catch (error) {
    console.error('Error retrieving alerts:', error);
    return res.status(500).json({ error: 'Error retrieving alerts from database' });
  }
}

async function create(req, res) {
  const payload = parseAlertPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const relationError = await validateRelations(payload);
    if (relationError) {
      return res.status(400).json({ error: relationError });
    }

    const id = await alertsService.createAlert(req.user.id, payload);
    const alert = await alertsService.getAlertByIdAndUserId(id, req.user.id);
    return res.status(201).json({ message: 'Alert created successfully', alert });
  } catch (error) {
    console.error('Error creating alert:', error);
    return res.status(500).json({ error: 'Error creating alert in database' });
  }
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

  try {
    const existingAlert = await alertsService.getAlertByIdAndUserId(id, req.user.id);
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const relationError = await validateRelations(payload);
    if (relationError) {
      return res.status(400).json({ error: relationError });
    }

    await alertsService.updateAlert(id, req.user.id, payload);
    const alert = await alertsService.getAlertByIdAndUserId(id, req.user.id);
    return res.json({ message: 'Alert updated successfully', alert });
  } catch (error) {
    console.error('Error updating alert:', error);
    return res.status(500).json({ error: 'Error updating alert in database' });
  }
}

async function updateStatus(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }

  const isActive = toBooleanFlag(req.body.is_active);
  if (isActive === null) {
    return res.status(400).json({ error: 'is_active must be a boolean value.' });
  }

  try {
    const existingAlert = await alertsService.getAlertByIdAndUserId(id, req.user.id);
    if (!existingAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (isActive === 1 && !alertsService.alertHasCriteria(existingAlert)) {
      return res.status(400).json({ error: 'Cannot activate an alert without criteria' });
    }

    await alertsService.updateAlertStatus(id, req.user.id, isActive === 1);
    const alert = await alertsService.getAlertByIdAndUserId(id, req.user.id);
    return res.json({ message: 'Alert status updated successfully', alert });
  } catch (error) {
    console.error('Error updating alert status:', error);
    return res.status(500).json({ error: 'Error updating alert status in database' });
  }
}

async function remove(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid alert id' });
  }

  try {
    const wasDeleted = await alertsService.deleteAlert(id, req.user.id);
    if (!wasDeleted) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    return res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return res.status(500).json({ error: 'Error deleting alert from database' });
  }
}

module.exports = {
  getAll,
  create,
  update,
  updateStatus,
  remove
};
