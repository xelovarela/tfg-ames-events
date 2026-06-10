/**
 * Pruebas de parseAudiencePayload.
 * Cubren rangos de edad válidos, límites opcionales y mensajes de error.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { parseAudiencePayload } = require('./audiencePayloadValidation');

test('audiencias: acepta un rango de edad completo con mínima y máxima válidas', () => {
  const payload = parseAudiencePayload({ name: 'Infantil', age_min: '0', age_max: '12' });

  assert.deepEqual(payload, {
    name: 'Infantil',
    ageMin: 0,
    ageMax: 12
  });
});

test('audiencias: rechaza edades negativas', () => {
  const payload = parseAudiencePayload({ name: 'Infantil', age_min: '-1', age_max: '12' });

  assert.equal(payload.error, 'age_min must be a non-negative integer when provided.');
});

test('audiencias: rechaza edades decimales o no numéricas', () => {
  const decimalPayload = parseAudiencePayload({ name: 'Juvenil', age_min: '12.5', age_max: '17' });
  const textPayload = parseAudiencePayload({ name: 'Juvenil', age_min: '12', age_max: 'diecisiete' });

  assert.equal(decimalPayload.error, 'age_min must be a non-negative integer when provided.');
  assert.equal(textPayload.error, 'age_max must be a non-negative integer when provided.');
});

test('audiencias: rechaza rangos incompletos', () => {
  const payload = parseAudiencePayload({ name: 'Adultos', age_min: '18', age_max: '' });

  assert.equal(payload.error, 'age_min and age_max must be provided together.');
});

test('audiencias: rechaza rangos invertidos donde la mínima supera la máxima', () => {
  const payload = parseAudiencePayload({ name: 'Juvenil', age_min: '18', age_max: '12' });

  assert.equal(payload.error, 'age_min cannot be greater than age_max.');
});
