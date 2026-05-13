/**
 * Este archivo contiene el controlador de roles.
 * Por ahora solo expone la lectura del catálogo de roles para usarlo
 * desde formularios de usuarios en el frontend.
 */
const rolesService = require('../services/rolesService');

async function getAll(req, res) {
  const roles = await rolesService.listRoles();
  return res.json(roles);
}

module.exports = {
  getAll
};
