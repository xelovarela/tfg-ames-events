/**
 * Este archivo agrupa funciones auxiliares de validacion y normalizacion.
 * Sirve para transformar valores recibidos desde peticiones HTTP a formatos seguros
 * antes de que los controladores los utilicen o los persistan en base de datos.
 */
const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)$/;

// Convierte un valor a entero positivo o devuelve null si no cumple la regla.
function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

// Valida parametros de ruta que deben ser identificadores enteros positivos.
function toPositiveIntParam(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  return toPositiveInt(value);
}

// Permite campos opcionales: acepta vacios y, si hay dato, exige entero positivo.
function toNullablePositiveInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return toPositiveInt(value);
}

// Valida una latitud dentro del rango geografico permitido.
function toLatitude(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
    return null;
  }
  return parsed;
}

// Valida una longitud dentro del rango geografico permitido.
function toLongitude(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
    return null;
  }
  return parsed;
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function formatMysqlDateTime(date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join('-') + ' ' + [
    padDatePart(date.getHours()),
    padDatePart(date.getMinutes()),
    padDatePart(date.getSeconds())
  ].join(':');
}

function parseLocalDateTimeString(value) {
  const match = value.match(LOCAL_DATE_TIME_PATTERN);
  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = hourValue === undefined ? 0 : Number(hourValue);
  const minute = minuteValue === undefined ? 0 : Number(minuteValue);
  const second = secondValue === undefined ? 0 : Number(secondValue);

  const date = new Date(year, month - 1, day, hour, minute, second);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return formatMysqlDateTime(date);
}

// Convierte una fecha opcional al formato DATETIME de MySQL sin desplazar la hora local.
function toNullableMysqlDateTime(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (LOCAL_DATE_TIME_PATTERN.test(trimmedValue)) {
      return parseLocalDateTimeString(trimmedValue);
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatMysqlDateTime(parsed);
}

// Normaliza distintos formatos de booleano al convenio numerico usado en MySQL.
function toBooleanFlag(value) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return 1;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return 0;
  }
  return null;
}

// Convierte importes monetarios opcionales a numero con dos decimales.
function toNullableMoney(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Number(parsed.toFixed(2));
}

// Se exportan las utilidades para reutilizarlas desde controladores y otros modulos.
module.exports = {
  toPositiveInt,
  toPositiveIntParam,
  toNullablePositiveInt,
  toLatitude,
  toLongitude,
  toNullableMysqlDateTime,
  toBooleanFlag,
  toNullableMoney
};
