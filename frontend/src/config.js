/**
 * Este archivo centraliza la URL base de la API consumida por el frontend.
 * Permite apuntar a distintos entornos usando variables de entorno sin cambiar
 * el resto de componentes que realizan peticiones HTTP.
 */
// Si no hay variable de entorno, el frontend apunta por defecto al backend local.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export { API_BASE_URL };
