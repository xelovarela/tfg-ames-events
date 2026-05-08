const {
  toPositiveInt,
  toNullablePositiveInt,
  toNullableMysqlDateTime,
  toBooleanFlag,
  toNullableMoney
} = require('./validation');

const MAX_TITLE_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGE_URL_LENGTH = 255;

function isMysqlDateTimeBefore(value, now) {
  if (!value) {
    return false;
  }

  const parsed = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed < now;
}

function parseEventPayload(body = {}, { rejectPastDate = false, now = new Date() } = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const categoryId = toPositiveInt(body.category_id);
  const locationId = toPositiveInt(body.location_id);
  const audienceId = toNullablePositiveInt(body.audience_id);
  const organizerId = toNullablePositiveInt(body.organizer_id);
  const eventDate = toNullableMysqlDateTime(body.event_date);
  const isFree = toBooleanFlag(body.is_free);
  let price = toNullableMoney(body.price);
  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() : '';

  if (!title || title.length > MAX_TITLE_LENGTH) {
    return { error: 'Invalid title. Must be between 1 and 150 characters.' };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Invalid description. Maximum length is 2000 characters.' };
  }

  if (imageUrl.length > MAX_IMAGE_URL_LENGTH) {
    return { error: 'image_url is too long.' };
  }

  if (!categoryId || !locationId) {
    return { error: 'category_id and location_id must be positive integers.' };
  }

  if (body.audience_id !== null && body.audience_id !== undefined && body.audience_id !== '' && !audienceId) {
    return { error: 'audience_id must be a positive integer when provided.' };
  }

  if (body.organizer_id !== null && body.organizer_id !== undefined && body.organizer_id !== '' && !organizerId) {
    return { error: 'organizer_id must be a positive integer when provided.' };
  }

  if (isFree === null) {
    return { error: 'is_free must be a boolean value (true/false or 1/0).' };
  }

  if (body.event_date !== null && body.event_date !== undefined && body.event_date !== '' && !eventDate) {
    return { error: 'event_date has an invalid format.' };
  }

  if (rejectPastDate && isMysqlDateTimeBefore(eventDate, now)) {
    return { error: 'event_date cannot be in the past.' };
  }

  if (isFree === 1) {
    price = null;
  }

  if (isFree === 0 && (price === null || price <= 0)) {
    return { error: 'price must be greater than 0 when is_free is false.' };
  }

  return {
    title,
    description: description || null,
    categoryId,
    locationId,
    audienceId,
    organizerId,
    eventDate,
    isFree,
    price,
    imageUrl: imageUrl || null
  };
}

module.exports = {
  parseEventPayload
};
