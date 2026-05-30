/**
 * Pruebas de filtros de eventos.
 * Aseguran que la URL, el filtrado local y los mensajes de resultado sean coherentes.
 */
import {
  buildSearchParamsFromFilters,
  filterEvents,
  filtersFromSearchParams,
  initialEventFilters
} from './eventFilters';

const EVENTS = [
  {
    id: 1,
    title: 'Concierto familiar',
    description: 'Musica en directo',
    category: 'Musica',
    audience: 'Familias',
    audience_id: 2,
    location: 'Casa da Cultura',
    location_locality: 'Bertamiráns',
    is_free: 1,
    event_date: '2026-05-08T18:00:00'
  },
  {
    id: 2,
    title: 'Taller de cocina',
    description: 'Recetas de temporada',
    category: 'Gastronomia',
    audience: 'Adultos',
    audience_id: 3,
    location: 'Aula municipal',
    location_locality: 'Milladoiro',
    is_free: 0,
    event_date: '2026-05-09T11:00:00'
  }
];

describe('eventFilters: listado y filtros compartidos por mapa y agenda', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-08T09:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('devuelve una lista vacia si el origen no es un array', () => {
    expect(filterEvents(null, initialEventFilters)).toEqual([]);
  });

  test('filtra por texto buscando en titulo, descripcion, categoria, lugar y publico', () => {
    expect(filterEvents(EVENTS, { ...initialEventFilters, search: 'cocina' }).map((event) => event.id))
      .toEqual([2]);
    expect(filterEvents(EVENTS, { ...initialEventFilters, search: 'familias' }).map((event) => event.id))
      .toEqual([1]);
  });

  test('combina categoria, localidad, publico y gratis para mostrar solo eventos compatibles', () => {
    expect(filterEvents(EVENTS, {
      ...initialEventFilters,
      category: 'Musica',
      locality: 'Bertamiráns',
      audienceId: '2',
      freeOnly: true
    }).map((event) => event.id)).toEqual([1]);
  });

  test('filtra por fecha de hoy y manana usando la fecha actual del sistema', () => {
    expect(filterEvents(EVENTS, { ...initialEventFilters, datePreset: 'today' }).map((event) => event.id))
      .toEqual([1]);
    expect(filterEvents(EVENTS, { ...initialEventFilters, datePreset: 'tomorrow' }).map((event) => event.id))
      .toEqual([2]);
  });

  test('convierte filtros a query string compartible y los recupera desde URLSearchParams', () => {
    const params = buildSearchParamsFromFilters({
      ...initialEventFilters,
      search: 'musica',
      category: 'Musica',
      audienceId: '2',
      locality: 'Bertamiráns',
      freeOnly: true
    });

    expect(params.toString()).toContain('search=musica');
    expect(filtersFromSearchParams(params)).toEqual({
      search: 'musica',
      datePreset: '',
      category: 'Musica',
      audienceId: '2',
      locality: 'Bertamiráns',
      freeOnly: true
    });
  });
});
