/**
 * Middlewares de autorización basados en JWT y roles.
 * Validan la cabecera Authorization y dejan en req.user los datos minimos
 * que necesitan los controladores protegidos.
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

function requireAuth(req, res, next) {
  // Se espera el formato "Bearer <token>" en la cabecera Authorization.
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    };

    return next();
  } catch (error) {
    return next();
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' });
  }

  next();
}

function requireAnyRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción.' });
    }

    next();
  };
}

module.exports = {
  optionalAuth,
  attachUserIfAuthenticated: optionalAuth, // Alias para compatibilidad
  requireAuth,
  requireAdmin,
  requireAnyRole
};
