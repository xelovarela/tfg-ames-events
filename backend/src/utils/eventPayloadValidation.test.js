/**
 * Pruebas de parseEventPayload.
 * Verifican conversiones de tipos, campos obligatorios y validaciones de fecha.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { parseEventPayload } = require('./eventPayloadValidation');

const VALID_EVENT_BODY = {
  title: 'Taller creativo',
  description: '',
  category_id: '1',
  location_id: '2',
  audience_id: '',
  organizer_id: '',
  event_date: '2026-05-09T18:00',
  is_free: '1',
  price: ''
};

const NOW = new Date('2026-05-08T12:00:00');

test('eventos: acepta crear un evento gratuito con fecha futura y relaciones válidas', () => {
  const payload = parseEventPayload(VALID_EVENT_BODY, { rejectPastDate: true, now: NOW });

  assert.equal(payload.error, undefined);
  assert.equal(payload.title, 'Taller creativo');
  assert.equal(payload.eventDate, '2026-05-09 18:00:00');
  assert.equal(payload.isFree, 1);
  assert.equal(payload.price, null);
});

test('eventos: rechaza crear un evento con fecha pasada aunque el resto del payload sea válido', () => {
  const payload = parseEventPayload(
    { ...VALID_EVENT_BODY, event_date: '2026-05-08T11:59' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(payload.error, 'event_date cannot be in the past.');
});

test('eventos: rechaza fechas imposibles antes de llegar a base de datos', () => {
  const payload = parseEventPayload(
    { ...VALID_EVENT_BODY, event_date: '2026-02-31T10:00' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(payload.error, 'event_date has an invalid format.');
});

test('eventos: rechaza eventos de pago sin precio mayor que cero', () => {
  const payload = parseEventPayload(
    { ...VALID_EVENT_BODY, is_free: '0', price: '0' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(payload.error, 'price must be greater than 0 when is_free is false.');
});

test('eventos: elimina el precio cuando el evento es gratuito aunque llegue informado', () => {
  const payload = parseEventPayload(
    { ...VALID_EVENT_BODY, is_free: '1', price: '15.50' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(payload.error, undefined);
  assert.equal(payload.price, null);
});

test('eventos: rechaza categoría y ubicación no positivas', () => {
  const payload = parseEventPayload(
    { ...VALID_EVENT_BODY, category_id: '0', location_id: '-2' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(payload.error, 'category_id and location_id must be positive integers.');
});

test('eventos: rechaza audiencia u organizador inválidos cuando se envían', () => {
  const invalidAudiencePayload = parseEventPayload(
    { ...VALID_EVENT_BODY, audience_id: 'abc' },
    { rejectPastDate: true, now: NOW }
  );
  const invalidOrganizerPayload = parseEventPayload(
    { ...VALID_EVENT_BODY, organizer_id: 'abc' },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(invalidAudiencePayload.error, 'audience_id must be a positive integer when provided.');
  assert.equal(invalidOrganizerPayload.error, 'organizer_id must be a positive integer when provided.');
});

test('eventos: rechaza título vacío o demasiado largo', () => {
  const emptyTitlePayload = parseEventPayload(
    { ...VALID_EVENT_BODY, title: '   ' },
    { rejectPastDate: true, now: NOW }
  );
  const longTitlePayload = parseEventPayload(
    { ...VALID_EVENT_BODY, title: 'a'.repeat(151) },
    { rejectPastDate: true, now: NOW }
  );

  assert.equal(emptyTitlePayload.error, 'Invalid title. Must be between 1 and 150 characters.');
  assert.equal(longTitlePayload.error, 'Invalid title. Must be between 1 and 150 characters.');
});
