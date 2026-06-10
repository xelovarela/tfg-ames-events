/**
 * Este archivo contiene una prueba automatizada basica del frontend.
 * Su objetivo es verificar que el componente principal puede renderizarse dentro
 * del entorno de pruebas configurado con React Testing Library.
 */
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./AmesMap', () => function MockAmesMap() {
  return require('react').createElement('div', { 'data-testid': 'ames-map' });
});

jest.mock('./LocationManager', () => function MockLocationManager() {
  return require('react').createElement('div', { 'data-testid': 'location-manager' });
});

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App: pantalla inicial pública', () => {
  test('muestra la home real con accesos principales a listado, calendario, mapa y acerca de', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', {
      name: /la gu[ií]a local para encontrar el pr[oó]ximo plan/i
    })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^ver listado$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir calendario/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir mapa/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /acerca de/i })).toBeInTheDocument();
  });
});
