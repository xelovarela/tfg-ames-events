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
