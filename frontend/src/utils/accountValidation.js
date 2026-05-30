/**
 * Validaciones de cuenta compartidas por registro, perfil y cambio de contrasena.
 * Devuelven mensajes listos para mostrar sin mezclar reglas de formulario en las paginas.
 */
const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 100;

function isValidEmail(email) {
  // Expresion sencilla suficiente para descartar formatos claramente invalidos.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterForm({ username, email, password, confirmPassword }) {
  const trimmedUsername = String(username || '').trim();
  const trimmedEmail = String(email || '').trim().toLowerCase();

  if (!trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
    return 'Todos los campos son obligatorios.';
  }

  if (!isValidEmail(trimmedEmail)) {
    return 'Debes introducir un email valido.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }

  return null;
}

function buildRegisterPayload({ username, email, password }) {
  return {
    username: String(username || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    password
  };
}

function validateProfileUsername(username) {
  const trimmedUsername = String(username || '').trim();

  if (!trimmedUsername || trimmedUsername.length > MAX_USERNAME_LENGTH) {
    return 'El nombre de usuario no puede estar vacio.';
  }

  return null;
}

function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return 'Todos los campos de contraseña son obligatorios.';
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return 'La nueva contraseña debe tener al menos 8 caracteres.';
  }

  if (newPassword !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }

  return null;
}

export {
  buildRegisterPayload,
  isValidEmail,
  validatePasswordChange,
  validateProfileUsername,
  validateRegisterForm
};
