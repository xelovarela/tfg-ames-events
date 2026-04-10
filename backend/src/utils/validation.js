function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function toNullablePositiveInt(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return toPositiveInt(value);
}

function toLatitude(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < -90 || parsed > 90) {
    return null;
  }
  return parsed;
}

function toLongitude(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < -180 || parsed > 180) {
    return null;
  }
  return parsed;
}

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

function toBooleanFlag(value) {
  if (value === true || value === 1 || value === '1' || value === 'true') {
    return 1;
  }
  if (value === false || value === 0 || value === '0' || value === 'false') {
    return 0;
  }
  return null;
}

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

module.exports = {
  toPositiveInt,
  toNullablePositiveInt,
  toLatitude,
  toLongitude,
  toNullableDate,
  toBooleanFlag,
  toNullableMoney
};
