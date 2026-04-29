const test = require('node:test');
const assert = require('node:assert/strict');
const {
  TIME_SCOPES,
  canUsePrivilegedTimeScope,
  isPastEvent,
  normalizeTimeScope
} = require('../src/utils/eventTime');

test('normalizes event time scopes with an upcoming fallback', () => {
  assert.equal(normalizeTimeScope('past'), TIME_SCOPES.PAST);
  assert.equal(normalizeTimeScope('all'), TIME_SCOPES.ALL);
  assert.equal(normalizeTimeScope('unknown'), TIME_SCOPES.UPCOMING);
  assert.equal(normalizeTimeScope('', TIME_SCOPES.ALL), TIME_SCOPES.ALL);
});

test('allows privileged time scopes only for managers and admins', () => {
  assert.equal(canUsePrivilegedTimeScope({ role: 'admin' }), true);
  assert.equal(canUsePrivilegedTimeScope({ role: 'content_manager' }), true);
  assert.equal(canUsePrivilegedTimeScope({ role: 'user' }), false);
  assert.equal(canUsePrivilegedTimeScope(null), false);
});

test('detects past events from event_date without requiring a stored flag', () => {
  const now = new Date('2026-04-29T12:00:00');

  assert.equal(isPastEvent({ event_date: '2026-04-28T10:00:00' }, now), true);
  assert.equal(isPastEvent({ event_date: '2026-04-29T12:00:00' }, now), false);
  assert.equal(isPastEvent({ event_date: null }, now), false);
});
