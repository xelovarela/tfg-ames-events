/**
 * Este archivo contiene el controlador de organizadores.
 * Valida la información basica de contacto y coordina las operaciones CRUD
 * relacionadas con los organizadores almacenados en la aplicación.
 */
const organizersService = require('../services/organizersService');
const { toPositiveInt } = require('../utils/validation');

// Límites máximos para los campos editables del organizador.
const MAX_ORGANIZER_NAME_LENGTH = 100;
const MAX_ORGANIZER_EMAIL_LENGTH = 100;
const MAX_ORGANIZER_PHONE_LENGTH = 30;

// Normaliza nombre, email y teléfono antes de crear o actualizar registros.
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

// Devuelve todos los organizadores registrados.
async function getAll(req, res) {
  const organizers = await organizersService.listOrganizers();
  return res.json(organizers);
}

// Recupera un organizador concreto validando antes su id.
async function getById(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

  const organizer = await organizersService.getOrganizerById(id);
  if (!organizer) {
    return res.status(404).json({ error: 'Organizer not found' });
  }

  return res.json(organizer);
}

// Inserta un nuevo organizador cuándo el payload es correcto.
async function create(req, res) {
  const payload = parseOrganizerPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const id = await organizersService.createOrganizer(payload);
  return res.status(201).json({ message: 'Organizer created successfully', id });
}

// Modifica un organizador existente con la información recibida.
async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

  const payload = parseOrganizerPayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  const wasUpdated = await organizersService.updateOrganizer(id, payload);
  if (!wasUpdated) {
    return res.status(404).json({ error: 'Organizer not found' });
  }

  return res.json({ message: 'Organizer updated successfully' });
}

// Elimina un organizador solo si no está enlazado a eventos.
async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid organizer id' });
  }

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
}

// Se exportan las acciones CRUD para el router de organizadores.
module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
