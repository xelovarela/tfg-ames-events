/**
 * Este archivo contiene una prueba automatizada basica del frontend.
 * Su objetivo es verificar que el componente principal puede renderizarse dentro
 * del entorno de pruebas configurado con React Testing Library.
 */
import { render, screen } from '@testing-library/react';
import App from './App';

// Esta prueba intenta comprobar que la aplicacion principal se monta sin errores.
test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
