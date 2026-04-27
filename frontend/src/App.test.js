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

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Esta prueba comprueba que la aplicacion principal se monta en la home real.
test('renders the home page by default', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', {
    name: /encuentra planes municipales y familiares/i
  })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /ver agenda/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /abrir mapa/i })).toBeInTheDocument();
});
