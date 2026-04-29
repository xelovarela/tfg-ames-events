/**
 * Este archivo define helpers mínimos para peticiones autenticadas.
 * Permite añadir el token JWT actual en la cabecera Authorization sin
 * introducir una capa de abstraccion compleja sobre fetch.
 */
import { getAuthToken } from './authStorage';

function withAuthHeaders(baseHeaders = {}) {
  const token = getAuthToken();
  if (!token) {
    return { ...baseHeaders };
  }

  return {
    ...baseHeaders,
    Authorization: `Bearer ${token}`
  };
}

export { withAuthHeaders };
