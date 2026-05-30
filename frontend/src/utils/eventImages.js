/**
 * Utilidades de imagenes de evento.
 * Resuelven imagenes propias, imagenes por categoria y textos alternativos.
 */
import { API_BASE_URL } from '../config';

const PUBLIC_URL = process.env.PUBLIC_URL || '';
const DEFAULT_EVENT_IMAGE = `${PUBLIC_URL}/event-images/default-event.svg`;
const CATEGORY_FALLBACK_IMAGES = {
  cultura: `${PUBLIC_URL}/event-images/category-cultura.webp`,
  deporte: `${PUBLIC_URL}/event-images/category-deporte.webp`,
  educacion: `${PUBLIC_URL}/event-images/category-educacion.webp`,
  fiestas: `${PUBLIC_URL}/event-images/category-fiestas.webp`,
  gastronomia: `${PUBLIC_URL}/event-images/category-gastronomia.webp`,
  musica: `${PUBLIC_URL}/event-images/category-musica.webp`,
  naturaleza: `${PUBLIC_URL}/event-images/category-naturaleza.webp`,
  ocio: `${PUBLIC_URL}/event-images/category-ocio.webp`,
  salud: `${PUBLIC_URL}/event-images/category-salud.webp`
};
const LEGACY_DEMO_IMAGE_PATHS = new Set([
  '/event-images/demo-park.jpg',
  '/event-images/demo-sports.jpg',
  '/event-images/demo-library.jpg',
  '/event-images/demo-culture.jpg',
  'event-images/demo-park.jpg',
  'event-images/demo-sports.jpg',
  'event-images/demo-library.jpg',
  'event-images/demo-culture.jpg'
]);

function joinBaseUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

function normalizeCategoryName(categoryName) {
  return String(categoryName || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getCategoryFallbackImage(categoryName) {
  const normalizedCategory = normalizeCategoryName(categoryName);
  return CATEGORY_FALLBACK_IMAGES[normalizedCategory] || DEFAULT_EVENT_IMAGE;
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
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

function getEventImageUrl(event) {
  // Si el backend no aporta imagen valida, se usa una ilustracion estable por categoria.
  const imageUrl = event?.image_url;

  if (!imageUrl || LEGACY_DEMO_IMAGE_PATHS.has(imageUrl)) {
    return resolveImageUrl(event?.category_image_url) || getCategoryFallbackImage(event?.category);
  }

  return resolveImageUrl(imageUrl);
}

function getEventImageAlt(event) {
  const title = event?.title || 'evento';
  const category = event?.category ? ` de ${event.category}` : '';
  return `Imagen de ${title}${category}`;
}

export {
  CATEGORY_FALLBACK_IMAGES,
  DEFAULT_EVENT_IMAGE,
  LEGACY_DEMO_IMAGE_PATHS,
  getCategoryFallbackImage,
  getEventImageAlt,
  getEventImageUrl,
  resolveImageUrl
};
