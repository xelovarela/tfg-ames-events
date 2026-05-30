/**
 * Utilidades de tiempo para consultas de eventos.
 * Construyen filtros SQL reutilizables para distinguir eventos proximos,
 * pasados o todos sin duplicar condiciones en los servicios.
 */
const TIME_SCOPES = {
  UPCOMING: 'upcoming',
  PAST: 'past',
  ALL: 'all'
};

const VALID_TIME_SCOPES = new Set(Object.values(TIME_SCOPES));

function normalizeTimeScope(value, fallback = TIME_SCOPES.UPCOMING) {
  if (!value || !VALID_TIME_SCOPES.has(value)) {
    return fallback;
  }

  return value;
}

function canUsePrivilegedTimeScope(user) {
  return ['admin', 'content_manager'].includes(user?.role);
}

function buildTimeScopeWhereClause(timeScope, tableAlias = 'e') {
  const eventDateColumn = `${tableAlias}.event_date`;

  if (timeScope === TIME_SCOPES.PAST) {
    return `AND ${eventDateColumn} IS NOT NULL AND ${eventDateColumn} < NOW()`;
  }

  if (timeScope === TIME_SCOPES.UPCOMING) {
    return `AND (${eventDateColumn} IS NULL OR ${eventDateColumn} >= NOW())`;
  }

  return '';
}

function buildIsPastSelect(tableAlias = 'e') {
  return `CASE WHEN ${tableAlias}.event_date IS NOT NULL AND ${tableAlias}.event_date < NOW() THEN 1 ELSE 0 END AS is_past`;
}

function isPastEvent(event, now = new Date()) {
  if (!event?.event_date) {
    return false;
  }

  const eventDate = new Date(event.event_date);
  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  return eventDate < now;
}

module.exports = {
  TIME_SCOPES,
  normalizeTimeScope,
  canUsePrivilegedTimeScope,
  buildTimeScopeWhereClause,
  buildIsPastSelect,
  isPastEvent
};
