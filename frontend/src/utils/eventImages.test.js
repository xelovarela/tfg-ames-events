import { getCategoryFallbackImage, getEventImageAlt, getEventImageUrl, DEFAULT_EVENT_IMAGE } from './eventImages';

test('returns the default image when an event has no image', () => {
  expect(getEventImageUrl({})).toBe(DEFAULT_EVENT_IMAGE);
});

test('returns a category fallback image when an event has no uploaded image', () => {
  expect(getEventImageUrl({ category: 'Cultura' })).toBe('/event-images/cultura.png');
  expect(getEventImageUrl({ category: 'Gastronomía' })).toBe('/event-images/gastronomía.png');
  expect(getCategoryFallbackImage('Categoría inventada')).toBe(DEFAULT_EVENT_IMAGE);
});

test('replaces legacy demo images with the category fallback image', () => {
  expect(getEventImageUrl({ image_url: '/event-images/demo-sports.jpg', category: 'Deporte' }))
    .toBe('/event-images/deportes.png');
});

test('keeps absolute event image URLs unchanged', () => {
  const imageUrl = 'https://cdn.example.com/events/photo.jpg';

  expect(getEventImageUrl({ image_url: imageUrl })).toBe(imageUrl);
});

test('resolves uploaded event images against the API base URL', () => {
  expect(getEventImageUrl({ image_url: '/uploads/events/photo.jpg' }))
    .toBe('http://localhost:3001/uploads/events/photo.jpg');
  expect(getEventImageUrl({ image_url: 'uploads/events/photo.jpg' }))
    .toBe('http://localhost:3001/uploads/events/photo.jpg');
});

test('builds a descriptive event image alt text', () => {
  expect(getEventImageAlt({ title: 'Taller creativo', category: 'Educación' }))
    .toBe('Imagen de Taller creativo de Educación');
});
