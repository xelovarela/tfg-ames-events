/**
 * Este archivo prepara el entorno global de pruebas del frontend.
 * Importa extensiones para Jest y Testing Library que facilitan escribir aserciones
 * mas expresivas sobre el DOM renderizado.
 */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// Se activan matchers como toBeInTheDocument o toHaveTextContent.
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
