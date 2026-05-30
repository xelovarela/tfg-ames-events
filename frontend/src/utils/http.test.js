/**
 * Pruebas de lectura de respuestas HTTP.
 * Verifican JSON valido, cuerpos vacios y mensajes de error alternativos.
 */
import { readJsonResponse } from './http';

function createResponse({ ok = true, contentType = 'application/json', body = '' } = {}) {
  return {
    ok,
    headers: {
      get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null)
    },
    text: () => Promise.resolve(body)
  };
}

describe('readJsonResponse: lectura segura de respuestas HTTP', () => {
  test('devuelve el JSON cuando la API responde correctamente', async () => {
    const response = createResponse({
      body: JSON.stringify({ message: 'ok' })
    });

    await expect(readJsonResponse(response, 'Fallback error'))
      .resolves.toEqual({ message: 'ok' });
  });

  test('rechaza con el mensaje de error devuelto por la API', async () => {
    const response = createResponse({
      ok: false,
      body: JSON.stringify({ error: 'Invalid data' })
    });

    await expect(readJsonResponse(response, 'Fallback error'))
      .rejects.toThrow('Invalid data');
  });

  test('explica el problema cuando el frontend recibe HTML en vez de JSON', async () => {
    const response = createResponse({
      contentType: 'text/html',
      body: '<!doctype html><html></html>'
    });

    await expect(readJsonResponse(response, 'No se pudo cargar'))
      .rejects.toThrow(/recurso JSON esperado/i);
  });
});
