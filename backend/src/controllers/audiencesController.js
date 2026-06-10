/**
 * Este archivo contiene el controlador de audiencias.
 * Gestiona la validación del nombre y del rango de edades antes de utilizar
 * los servicios que leen o modifican la información en base de datos.
 */
const audiencesService = require('../services/audiencesService');
const { toPositiveInt } = require('../utils/validation');

// Límite maximo permitido para el nombre visible de la audiencia.
const MAX_AUDIENCE_NAME_LENGTH = 100;

// Convierte edades opcionales a enteros no negativos cuando el dato es válido.
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

// Valida y normaliza el cuerpo de la peticion para altas y ediciones.
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

// Devuelve todas las audiencias definidas.
async function getAll(req, res) {
  const audiences = await audiencesService.listAudiences();
  return res.json(audiences);
}

// Recupera una audiencia concreta a partir de su identificador.
async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

  const audience = await audiencesService.getAudienceById(id);
  if (!audience) {
    return res.status(404).json({ error: 'Audience not found' });
  }

  return res.json(audience);
}

// Crea una audiencia nueva si los datos cumplen las reglas del dominio.
async function create(req, res) {
  const payload = parseAudiencePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const id = await audiencesService.createAudience(payload);
  return res.status(201).json({ message: 'Audience created successfully', id });
}

// Actualiza una audiencia existente conservando la validación previa.
async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

  const payload = parseAudiencePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const wasUpdated = await audiencesService.updateAudience(id, payload);
  if (!wasUpdated) {
    return res.status(404).json({ error: 'Audience not found' });
  }

  return res.json({ message: 'Audience updated successfully' });
}

// Elimina una audiencia únicamente cuándo no está asociada a eventos.
async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid audience id' });
  }

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
}

// Se exportan las acciones CRUD para el router de audiencias.
module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
