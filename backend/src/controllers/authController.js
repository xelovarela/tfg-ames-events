const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-esto-en-produccion';
const JWT_EXPIRES_IN = '8h';

async function login(req, res) {
  const loginValue = typeof req.body.login === 'string' ? req.body.login.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!loginValue || !password) {
    return res.status(400).json({ error: 'Debes indicar usuario o email y contraseña.' });
  }

  try {
    const user = await authService.getUserByLogin(loginValue);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno al iniciar sesión.' });
  }
}

function me(req, res) {
  return res.json({
    user: req.user
  });
}

module.exports = {
  login,
  me
};