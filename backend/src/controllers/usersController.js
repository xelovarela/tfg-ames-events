/**
 * Controlador de administracion de usuarios.
 * Expone solo operaciones seguras para admin: listar, consultar,
 * cambiar rol y activar/desactivar cuentas.
 */
const bcrypt = require('bcrypt');
const usersService = require('../services/usersService');
const rolesService = require('../services/rolesService');
const { toBooleanFlag, toPositiveIntParam } = require('../utils/validation');

const ALLOWED_ROLE_NAMES = ['admin', 'content_manager', 'user'];
const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 100;
const SALT_ROUNDS = 10;
const OWN_PROFILE_ALLOWED_FIELDS = ['username'];
const OWN_PASSWORD_ALLOWED_FIELDS = ['currentPassword', 'newPassword'];

function getRequestedRoleName(body) {
  const roleName = typeof body.role === 'string'
    ? body.role.trim()
    : typeof body.roleName === 'string'
      ? body.roleName.trim()
      : '';

  return roleName;
}

function getUnexpectedFields(body, allowedFields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [];
  }

  return Object.keys(body).filter((field) => !allowedFields.includes(field));
}

async function getAll(req, res) {
  try {
    const users = await usersService.listUsers();
    return res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.status(500).json({ error: 'Error retrieving users from database' });
  }
}

async function getById(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    return res.status(500).json({ error: 'Error retrieving user from database' });
  }
}

async function updateRole(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const roleName = getRequestedRoleName(req.body);
  if (!roleName) {
    return res.status(400).json({ error: 'Role is required' });
  }

  if (!ALLOWED_ROLE_NAMES.includes(roleName)) {
    return res.status(400).json({ error: 'Role is not allowed' });
  }

  if (Number(req.user.id) === id && roleName !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove your own admin role' });
  }

  try {
    const [existingUser, role] = await Promise.all([
      usersService.getUserById(id),
      rolesService.getRoleByName(roleName)
    ]);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!role) {
      return res.status(400).json({ error: 'Role does not exist' });
    }

    await usersService.updateUserRole(id, role.id);
    const updatedUser = await usersService.getUserById(id);
    if (!updatedUser || updatedUser.role !== role.name) {
      return res.status(500).json({ error: 'User role was updated but could not be verified' });
    }

    return res.json({
      message: 'User role updated successfully',
      role: updatedUser.role,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Error updating user role in database' });
  }
}

async function updateStatus(req, res) {
  const id = toPositiveIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const isActive = toBooleanFlag(req.body.is_active);
  if (isActive === null) {
    return res.status(400).json({ error: 'is_active must be a boolean value' });
  }

  if (Number(req.user.id) === id && isActive === 0) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }

  try {
    const existingUser = await usersService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await usersService.updateUserStatus(id, isActive === 1);
    const updatedUser = await usersService.getUserById(id);

    return res.json({
      message: 'User status updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ error: 'Error updating user status in database' });
  }
}

async function updateMe(req, res) {
  const userId = Number(req.user?.id);
  const unexpectedFields = getUnexpectedFields(req.body, OWN_PROFILE_ALLOWED_FIELDS);
  if (unexpectedFields.length > 0) {
    return res.status(400).json({ error: 'Solo se permite actualizar el nombre de usuario desde este endpoint.' });
  }

  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';

  if (!username || username.length > MAX_USERNAME_LENGTH) {
    return res.status(400).json({ error: `El nombre de usuario es obligatorio y debe tener entre 1 y ${MAX_USERNAME_LENGTH} caracteres.` });
  }

  try {
    const existingUserWithUsername = await usersService.getUserByUsernameExcludingId(username, userId);
    if (existingUserWithUsername) {
      return res.status(409).json({ error: 'Ya existe otro usuario con ese nombre de usuario.' });
    }

    const updated = await usersService.updateOwnUsername(userId, username);
    if (!updated) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const user = await usersService.getUserById(userId);
    return res.json({
      message: 'Perfil actualizado correctamente.',
      user
    });
  } catch (error) {
    console.error('Error updating own profile:', error);
    return res.status(500).json({ error: 'Error interno al actualizar perfil.' });
  }
}

async function updateMyPassword(req, res) {
  const userId = Number(req.user?.id);
  const unexpectedFields = getUnexpectedFields(req.body, OWN_PASSWORD_ALLOWED_FIELDS);
  if (unexpectedFields.length > 0) {
    return res.status(400).json({ error: 'Solo se permite enviar la contrasena actual y la nueva contrasena.' });
  }

  const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!currentPassword.trim() || !newPassword.trim()) {
    return res.status(400).json({ error: 'Debes indicar la contrasena actual y la nueva contrasena.' });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `La nueva contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` });
  }

  try {
    const credentials = await usersService.getUserCredentialsById(userId);
    if (!credentials) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const passwordOk = await bcrypt.compare(currentPassword, credentials.password_hash);
    if (!passwordOk) {
      return res.status(400).json({ error: 'La contrasena actual no es correcta.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await usersService.updateOwnPassword(userId, passwordHash);

    return res.json({ message: 'Contrasena actualizada correctamente.' });
  } catch (error) {
    console.error('Error updating own password:', error);
    return res.status(500).json({ error: 'Error interno al cambiar contrasena.' });
  }
}

module.exports = {
  updateMe,
  updateMyPassword,
  getAll,
  getById,
  updateRole,
  updateStatus
};
