import { getCategoryFallbackImage, getEventImageAlt, getEventImageUrl, DEFAULT_EVENT_IMAGE } from './eventImages';

describe('eventImages: seleccion de imagenes para tarjetas de eventos', () => {
  test('usa la imagen por defecto cuando el evento no trae imagen ni categoria', () => {
    expect(getEventImageUrl({})).toBe(DEFAULT_EVENT_IMAGE);
  });

  test('usa una imagen local de categoria cuando no hay imagen subida', () => {
    expect(getEventImageUrl({ category: 'Cultura' })).toBe('/event-images/category-cultura.webp');
    expect(getEventImageUrl({ category: 'Gastronomía' })).toBe('/event-images/category-gastronomia.webp');
    expect(getCategoryFallbackImage('Categoria inventada')).toBe(DEFAULT_EVENT_IMAGE);
  });

  test('prioriza la imagen de categoria enviada por la API frente al fallback local', () => {
    expect(getEventImageUrl({
      category: 'Cultura',
      category_image_url: '/uploads/categories/category-photo.webp'
    })).toBe('http://localhost:3001/uploads/categories/category-photo.webp');
  });

  test('sustituye imagenes demo antiguas por el fallback de categoria', () => {
    expect(getEventImageUrl({
      image_url: '/event-images/demo-sports.jpg',
      category: 'Deporte',
      category_image_url: '/event-images/category-deporte.webp'
    })).toBe('/event-images/category-deporte.webp');
  });

  test('respeta URLs absolutas de imagenes externas', () => {
    const imageUrl = 'https://cdn.example.com/events/photo.jpg';

    expect(getEventImageUrl({ image_url: imageUrl })).toBe(imageUrl);
  });

  test('convierte rutas de uploads en URLs completas del backend', () => {
    expect(getEventImageUrl({ image_url: '/uploads/events/photo.jpg' }))
      .toBe('http://localhost:3001/uploads/events/photo.jpg');
    expect(getEventImageUrl({ image_url: 'uploads/events/photo.jpg' }))
      .toBe('http://localhost:3001/uploads/events/photo.jpg');
  });

  test('genera un texto alternativo descriptivo para lectores de pantalla', () => {
    expect(getEventImageAlt({ title: 'Taller creativo', category: 'Educación' }))
      .toBe('Imagen de Taller creativo de Educación');
  });
});
