/**
 * Este archivo contiene el controlador de roles.
 * Por ahora solo expone la lectura del catalogo de roles para usarlo
 * desde formularios de usuarios en el frontend.
 */
const rolesService = require('../services/rolesService');

async function getAll(req, res) {
  try {
    const roles = await rolesService.listRoles();
    return res.json(roles);
  } catch (error) {
    console.error('Error retrieving roles:', error);
    return res.status(500).json({ error: 'Error retrieving roles from database' });
  }
}

module.exports = {
  getAll
};
