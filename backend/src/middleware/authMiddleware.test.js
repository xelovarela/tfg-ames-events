/**
 * Pruebas unitarias de los middlewares de autenticacion y roles.
 * Comprueban tokens validos, errores de autorizacion y permisos por perfil.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const {
  requireAdmin,
  requireAnyRole,
  requireAuth
} = require('./authMiddleware');
const { JWT_SECRET } = require('../config/auth');

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

function createToken(payload = {}) {
  return jwt.sign({
    sub: 1,
    username: 'admin',
    role: 'admin',
    ...payload
  }, JWT_SECRET);
}

test('auth: requireAuth rechaza peticiones sin cabecera Bearer', () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'No autenticado.' });
});

test('auth: requireAuth carga id, username y rol desde un JWT valido', () => {
  const req = { headers: { authorization: `Bearer ${createToken({ sub: 42, username: 'gestor', role: 'content_manager' })}` } };
  const res = createResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: 42, username: 'gestor', role: 'content_manager' });
});

test('auth: requireAdmin permite admin y bloquea usuarios sin rol administrador', () => {
  const adminReq = { user: { id: 1, role: 'admin' } };
  const userReq = { user: { id: 2, role: 'user' } };
  const blockedRes = createResponse();
  let adminNextCalled = false;

  requireAdmin(adminReq, createResponse(), () => {
    adminNextCalled = true;
  });
  requireAdmin(userReq, blockedRes, () => {});

  assert.equal(adminNextCalled, true);
  assert.equal(blockedRes.statusCode, 403);
  assert.deepEqual(blockedRes.body, { error: 'Acceso restringido a administradores.' });
});

test('auth: requireAnyRole permite gestores de contenido y bloquea roles fuera de la lista', () => {
  const middleware = requireAnyRole(['admin', 'content_manager']);
  const managerReq = { user: { id: 3, role: 'content_manager' } };
  const userReq = { user: { id: 4, role: 'user' } };
  const blockedRes = createResponse();
  let managerNextCalled = false;

  middleware(managerReq, createResponse(), () => {
    managerNextCalled = true;
  });
  middleware(userReq, blockedRes, () => {});

  assert.equal(managerNextCalled, true);
  assert.equal(blockedRes.statusCode, 403);
  assert.deepEqual(blockedRes.body, { error: 'No tienes permisos suficientes para esta acción.' });
});
