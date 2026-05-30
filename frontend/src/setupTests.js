/**
 * Este archivo prepara el entorno global de pruebas del frontend.
 * Importa extensiones para Jest y Testing Library que facilitan escribir aserciones
 * más expresivas sobre el DOM renderizado.
 */
// Se activan matchers como toBeInTheDocument o toHaveTextContent.
// Esto permite escribir aserciones mas legibles sobre nodos del DOM.
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
