/**
 * Validaciones de audiencias en el frontend.
 * Preparan el payload que consumen las pantallas de administracion.
 */
function parseOptionalAge(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function validateAudience(form) {
  const name = typeof form.name === 'string' ? form.name.trim() : '';
  const ageMin = parseOptionalAge(form.age_min);
  const ageMax = parseOptionalAge(form.age_max);

  if (!name || name.length > 100) {
    return 'El nombre es obligatorio y debe tener entre 1 y 100 caracteres.';
  }

  if (form.age_min !== '' && form.age_min !== null && form.age_min !== undefined && ageMin === null) {
    return 'La edad minima debe ser un numero entero.';
  }

  if (form.age_max !== '' && form.age_max !== null && form.age_max !== undefined && ageMax === null) {
    return 'La edad maxima debe ser un numero entero.';
  }

  if ((ageMin === null && ageMax !== null) || (ageMin !== null && ageMax === null)) {
    return 'Debes indicar edad minima y maxima juntas.';
  }

  if (ageMin !== null && ageMax !== null && (ageMin < 0 || ageMax < 0 || ageMin > ageMax)) {
    return 'Rango de edad invalido.';
  }

  return null;
}

function buildAudiencePayload(form) {
  return {
    name: form.name.trim(),
    age_min: form.age_min === '' ? null : Number(form.age_min),
    age_max: form.age_max === '' ? null : Number(form.age_max)
  };
}

export { buildAudiencePayload, validateAudience };
