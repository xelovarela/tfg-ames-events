/**
 * Centraliza la clave JWT usada por la API.
 * En desarrollo permite arrancar sin variable de entorno, pero en produccion
 * obliga a configurar JWT_SECRET para no firmar tokens con una clave insegura.
 */
const DEVELOPMENT_JWT_SECRET = 'cambiar-esto-en-producción';

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return DEVELOPMENT_JWT_SECRET;
}

module.exports = {
  JWT_SECRET: getJwtSecret()
};
