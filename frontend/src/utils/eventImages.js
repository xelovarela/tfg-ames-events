import { API_BASE_URL } from '../config';

const PUBLIC_URL = process.env.PUBLIC_URL || '';
const DEFAULT_EVENT_IMAGE = `${PUBLIC_URL}/event-images/default-event.svg`;

function joinBaseUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function getEventImageUrl(event) {
  const imageUrl = event?.image_url;

  if (!imageUrl) {
    return DEFAULT_EVENT_IMAGE;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads/')) {
    return joinBaseUrl(API_BASE_URL, imageUrl);
  }

  if (imageUrl.startsWith('uploads/')) {
    return joinBaseUrl(API_BASE_URL, imageUrl);
  }

  return imageUrl;
}

export {
  DEFAULT_EVENT_IMAGE,
  getEventImageUrl
};
