import { API_BASE_URL } from '../config';

const DEFAULT_EVENT_IMAGE = '/event-images/default-event.svg';

function getEventImageUrl(event) {
  const imageUrl = event?.image_url;

  if (!imageUrl) {
    return DEFAULT_EVENT_IMAGE;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
}

export {
  DEFAULT_EVENT_IMAGE,
  getEventImageUrl
};
