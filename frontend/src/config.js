/**
 * Este archivo centraliza la URL base de la API consumida por el frontend.
 * Permite apuntar a distintos entornos usando variables de entorno sin cambiar
 * el resto de componentes que realizan peticiones HTTP.
 */
const LOCAL_API_BASE_URL = 'http://localhost:3001';
const PRODUCTION_API_BASE_URL = 'https://api.anxovarela.es';

function isLocalFrontend() {
  if (typeof window === 'undefined') {
    return false;
  }

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

// La variable de entorno tiene prioridad. Si falta, elegimos segun el host real.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  || (isLocalFrontend() ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL);

export { API_BASE_URL };
