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

test('reads a successful JSON response', async () => {
  const response = createResponse({
    body: JSON.stringify({ message: 'ok' })
  });

  await expect(readJsonResponse(response, 'Fallback error'))
    .resolves.toEqual({ message: 'ok' });
});

test('uses the API error message when a JSON response is not ok', async () => {
  const response = createResponse({
    ok: false,
    body: JSON.stringify({ error: 'Invalid data' })
  });

  await expect(readJsonResponse(response, 'Fallback error'))
    .rejects.toThrow('Invalid data');
});

test('adds a useful hint when the server returns HTML instead of JSON', async () => {
  const response = createResponse({
    contentType: 'text/html',
    body: '<!doctype html><html></html>'
  });

  await expect(readJsonResponse(response, 'No se pudo cargar'))
    .rejects.toThrow(/apunte al backend/i);
});
