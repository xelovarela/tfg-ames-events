const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-esto-en-produccion';
const JWT_EXPIRES_IN = '8h';
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 50;
const MAX_EMAIL_LENGTH = 150;
const VERIFICATION_TOKEN_BYTES = 32;
const VERIFICATION_EXPIRY_HOURS = 24;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildVerificationExpiryDate() {
  return new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);
}

function generateVerificationToken() {
  return crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString('hex');
}

async function register(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!name || name.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `El nombre es obligatorio y debe tener entre 1 y ${MAX_NAME_LENGTH} caracteres.` });
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Debes indicar un email valido.' });
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
  }

  try {
    const [existingUser, defaultRole] = await Promise.all([
      authService.getUserByEmail(email),
      authService.getRoleByName('user')
    ]);

    if (existingUser) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con ese email.' });
    }

    if (!defaultRole) {
      return res.status(500).json({ error: 'No existe el rol base de usuario.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = generateVerificationToken();
    const verificationExpiresAt = buildVerificationExpiryDate();

    await authService.createRegisteredUser({
      name,
      email,
      passwordHash,
      roleId: defaultRole.id,
      emailVerified: false,
      verificationToken,
      verificationExpiresAt
    });

    await emailService.sendVerificationEmail({
      to: email,
      name,
      token: verificationToken
    });

    return res.status(201).json({
      message: 'Cuenta creada correctamente. Revisa tu correo para verificarla antes de iniciar sesion.'
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno al registrar usuario.' });
  }
}

async function verifyEmail(req, res) {
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';

  if (!token) {
    return res.status(400).json({ error: 'Token de verificacion no proporcionado.' });
  }

  try {
    const user = await authService.getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ error: 'El token de verificacion es invalido.' });
    }

    if (!user.verification_expires_at || new Date(user.verification_expires_at) < new Date()) {
      await authService.clearVerificationToken(user.id);
      return res.status(400).json({ error: 'El token de verificacion ha expirado. Solicita uno nuevo.' });
    }

    await authService.markEmailAsVerified(user.id);
    return res.json({ message: 'Email verificado correctamente. Ya puedes iniciar sesion.' });
  } catch (error) {
    console.error('Error en verifyEmail:', error);
    return res.status(500).json({ error: 'Error interno al verificar email.' });
  }
}

async function resendVerification(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const genericResponse = {
    message: 'Si existe una cuenta pendiente de verificacion, se ha enviado un nuevo correo.'
  };

  if (!email || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return res.json(genericResponse);
  }

  try {
    const user = await authService.getUserByEmail(email);
    if (user && Number(user.email_verified) !== 1) {
      const verificationToken = generateVerificationToken();
      const verificationExpiresAt = buildVerificationExpiryDate();

      await authService.storeVerificationToken(user.id, verificationToken, verificationExpiresAt);
      await emailService.sendVerificationEmail({
        to: user.email,
        name: user.username,
        token: verificationToken
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error('Error en resendVerification:', error);
    return res.status(500).json({ error: 'Error interno al reenviar verificacion.' });
  }
}

async function login(req, res) {
  const loginValue = typeof req.body.login === 'string' ? req.body.login.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!loginValue || !password) {
    return res.status(400).json({ error: 'Debes indicar usuario o email y contrasena.' });
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

    if (Number(user.is_active) !== 1) {
      return res.status(403).json({ error: 'Tu cuenta esta desactivada. Contacta con administracion.' });
    }

    if (Number(user.email_verified) !== 1) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesion.' });
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
        role: user.role,
        email_verified: Number(user.email_verified) === 1
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno al iniciar sesion.' });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getSafeUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: Number(user.email_verified) === 1
      }
    });
  } catch (error) {
    console.error('Error en me:', error);
    return res.status(500).json({ error: 'Error interno al recuperar perfil.' });
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  me
};
