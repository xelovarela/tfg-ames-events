/**
 * Utilidades de validacion para audiencias en el backend.
 * Limpian el nombre y normalizan los límites de edad antes de guardar.
 */
const MAX_AUDIENCE_NAME_LENGTH = 100;

function toNullableNonNegativeInt(value) {
  // Los campos vacíos se tratan como ausencia de límite de edad.
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

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

module.exports = {
  parseAudiencePayload
};
