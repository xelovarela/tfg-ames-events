/**
 * Este archivo agrupa funciones auxiliares de validacion y normalizacion.
 * Sirve para transformar valores recibidos desde peticiones HTTP a formatos seguros
 * antes de que los controladores los utilicen o los persistan en base de datos.
 */
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

// Convierte una fecha opcional a objeto Date solo cuando el valor es valido.
function toNullableDate(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
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
  toNullableDate,
  toBooleanFlag,
  toNullableMoney
};
