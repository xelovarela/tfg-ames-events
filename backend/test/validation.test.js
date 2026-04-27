const test = require('node:test');
const assert = require('node:assert/strict');
const {
  toPositiveInt,
  toPositiveIntParam,
  toNullablePositiveInt,
  toLatitude,
  toLongitude,
  toNullableMysqlDateTime,
  toBooleanFlag,
  toNullableMoney
} = require('../src/utils/validation');

test('normalizes positive integer values used by route and body validation', () => {
  assert.equal(toPositiveInt('12'), 12);
  assert.equal(toPositiveInt(0), null);
  assert.equal(toPositiveInt('1.5'), null);

  assert.equal(toPositiveIntParam('42'), 42);
  assert.equal(toPositiveIntParam('0042'), null);
  assert.equal(toPositiveIntParam('abc'), null);

  assert.equal(toNullablePositiveInt(''), null);
  assert.equal(toNullablePositiveInt(undefined), null);
  assert.equal(toNullablePositiveInt('9'), 9);
});

test('validates geographic coordinates within accepted ranges', () => {
  assert.equal(toLatitude('42.8612'), 42.8612);
  assert.equal(toLatitude('91'), null);
  assert.equal(toLongitude('-8.6539'), -8.6539);
  assert.equal(toLongitude('-181'), null);
});

test('keeps local event datetimes in MySQL format without timezone shifting', () => {
  assert.equal(toNullableMysqlDateTime('2026-05-15T18:30'), '2026-05-15 18:30:00');
  assert.equal(toNullableMysqlDateTime('2026-02-30T10:00'), null);
  assert.equal(toNullableMysqlDateTime(''), null);
});

test('normalizes boolean flags and money values for persistence', () => {
  assert.equal(toBooleanFlag(true), 1);
  assert.equal(toBooleanFlag('false'), 0);
  assert.equal(toBooleanFlag('yes'), null);

  assert.equal(toNullableMoney('4.567'), 4.57);
  assert.equal(toNullableMoney('0'), 0);
  assert.equal(toNullableMoney('-1'), null);
});
