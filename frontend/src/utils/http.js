async function readJsonResponse(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  if (!contentType.includes('application/json')) {
    const htmlHint = bodyText.trim().startsWith('<')
      ? ' El servidor devolvio HTML; revisa que la URL de la API apunte al backend y no al frontend.'
      : '';

    throw new Error(`${fallbackMessage}${htmlHint}`);
  }

  const data = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }

  return data;
}

export { readJsonResponse };
