/**
 * Controlador de administracion de usuarios.
 * Expone solo operaciones seguras para admin: listar, consultar,
 * cambiar rol y activar/desactivar cuentas.
 */
const usersService = require('../services/usersService');
const rolesService = require('../services/rolesService');
const { toBooleanFlag, toPositiveIntParam } = require('../utils/validation');

const ALLOWED_ROLE_NAMES = ['admin', 'content_manager', 'user'];

function getRequestedRoleName(body) {
  const roleName = typeof body.role === 'string'
    ? body.role.trim()
    : typeof body.roleName === 'string'
      ? body.roleName.trim()
      : '';

  return roleName;
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

module.exports = {
  getAll,
  getById,
  updateRole,
  updateStatus
};
