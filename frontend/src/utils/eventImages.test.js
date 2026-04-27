import { getEventImageUrl, DEFAULT_EVENT_IMAGE } from './eventImages';

test('returns the default image when an event has no image', () => {
  expect(getEventImageUrl({})).toBe(DEFAULT_EVENT_IMAGE);
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
