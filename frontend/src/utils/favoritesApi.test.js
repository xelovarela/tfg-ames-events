/**
 * Pruebas del cliente de favoritos.
 * Simulan respuestas HTTP para comprobar sesiones expiradas y operaciones correctas.
 */
import { addFavorite, listFavoriteIds, listFavorites, removeFavorite } from './favoritesApi';
import { clearAuthSession, getAuthSession, setAuthSession } from './authStorage';

function mockJsonResponse({ ok = true, status = 200, body = {} } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body)
  };
}

describe('favoritesApi: favoritos autenticados', () => {
  beforeEach(() => {
    clearAuthSession();
    setAuthSession({
      token: 'token-admin',
      user: { id: 1, username: 'admin', role: 'admin' }
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearAuthSession();
  });

  test('lista favoritos enviando el token de sesion', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ body: [{ id: 10, title: 'Evento' }] }));

    await expect(listFavorites()).resolves.toEqual([{ id: 10, title: 'Evento' }]);
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer token-admin');
  });

  test('convierte una respuesta sin event_ids en lista vacia para evitar errores de renderizado', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({ body: {} }));

    await expect(listFavoriteIds()).resolves.toEqual([]);
  });

  test('crea y elimina favoritos usando los metodos HTTP esperados', async () => {
    global.fetch
      .mockResolvedValueOnce(mockJsonResponse({ status: 201, body: { message: 'ok' } }))
      .mockResolvedValueOnce(mockJsonResponse({ body: { message: 'ok' } }));

    await addFavorite(7);
    await removeFavorite(7);

    expect(global.fetch.mock.calls[0][0]).toMatch(/\/favorites\/7$/);
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
    expect(global.fetch.mock.calls[1][1].method).toBe('DELETE');
  });

  test('limpia la sesion y muestra un mensaje claro cuando la API devuelve 401', async () => {
    global.fetch.mockResolvedValueOnce(mockJsonResponse({
      ok: false,
      status: 401,
      body: { error: 'Unauthorized' }
    }));

    await expect(listFavorites()).rejects.toThrow('Tu sesión ha expirado. Vuelve a iniciar sesión.');
    expect(getAuthSession()).toBeNull();
  });
});
