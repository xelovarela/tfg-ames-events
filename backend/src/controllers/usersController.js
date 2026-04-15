/**
 * Este archivo contiene el controlador de usuarios.
 * Implementa CRUD con validaciones basicas de negocio y garantiza
 * que password_hash nunca salga en respuestas al frontend.
 */
const bcrypt = require('bcrypt');
const usersService = require('../services/usersService');
const rolesService = require('../services/rolesService');
const { toPositiveInt } = require('../utils/validation');

const MAX_USERNAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 6;
const SALT_ROUNDS = 10;

function parseCreatePayload(body) {
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const roleId = toPositiveInt(body.role_id);

  if (!username || username.length > MAX_USERNAME_LENGTH) {
    return { error: 'Invalid username. Must be between 1 and 100 characters.' };
  }

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return { error: 'Invalid email. Must be between 1 and 100 characters.' };
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { error: 'Invalid password. Minimum length is 6 characters.' };
  }

  if (!roleId) {
    return { error: 'role_id must be a positive integer.' };
  }

  return { username, email, password, roleId };
}

function parseUpdatePayload(body) {
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const roleId = toPositiveInt(body.role_id);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || username.length > MAX_USERNAME_LENGTH) {
    return { error: 'Invalid username. Must be between 1 and 100 characters.' };
  }

  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return { error: 'Invalid email. Must be between 1 and 100 characters.' };
  }

  if (!roleId) {
    return { error: 'role_id must be a positive integer.' };
  }

  if (password && password.length < MIN_PASSWORD_LENGTH) {
    return { error: 'Invalid password. Minimum length is 6 characters when provided.' };
  }

  return {
    username,
    email,
    roleId,
    password: password || null
  };
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
  const id = toPositiveInt(req.params.id);
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

async function create(req, res) {
  const payload = parseCreatePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const [roleExists, conflictUser] = await Promise.all([
      rolesService.roleExists(payload.roleId),
      usersService.getUserByUsernameOrEmail(payload.username, payload.email)
    ]);

    if (!roleExists) {
      return res.status(400).json({ error: 'role_id does not exist' });
    }

    if (conflictUser) {
      return res.status(409).json({ error: 'username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const id = await usersService.createUser({
      username: payload.username,
      email: payload.email,
      passwordHash,
      roleId: payload.roleId
    });

    return res.status(201).json({ message: 'User created successfully', id });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Error creating user in database' });
  }
}

async function update(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const payload = parseUpdatePayload(req.body);
  if (payload.error) {
    return res.status(400).json({ error: payload.error });
  }

  try {
    const [existingUser, roleExists, conflictUser] = await Promise.all([
      usersService.getUserById(id),
      rolesService.roleExists(payload.roleId),
      usersService.getUserByUsernameOrEmailExcludingId(payload.username, payload.email, id)
    ]);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!roleExists) {
      return res.status(400).json({ error: 'role_id does not exist' });
    }

    if (conflictUser) {
      return res.status(409).json({ error: 'username or email already exists' });
    }

    if (payload.password) {
      const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
      await usersService.updateUserWithPassword(id, {
        username: payload.username,
        email: payload.email,
        roleId: payload.roleId,
        passwordHash
      });
    } else {
      await usersService.updateUser(id, {
        username: payload.username,
        email: payload.email,
        roleId: payload.roleId
      });
    }

    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Error updating user in database' });
  }
}

async function remove(req, res) {
  const id = toPositiveInt(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const existingUser = await usersService.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await usersService.deleteUser(id);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Error deleting user from database' });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
