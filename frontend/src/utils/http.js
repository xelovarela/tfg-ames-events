/**
 * Utilidad comun para leer respuestas JSON.
 * La URL base de la API se centraliza en ../config.js; este modulo no la redefine.
 * Crea errores enriquecidos con status y cuerpo para que las paginas muestren mensajes claros.
 */
async function readJsonResponse(response, fallbackMessage) {
  const buildError = (message, data = null) => {
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    return error;
  };

  if (typeof response.text !== 'function') {
    const data = typeof response.json === 'function' ? await response.json() : null;
    if (!response.ok) {
      throw buildError(data?.error || fallbackMessage, data);
    }

    return data;
  }

  const contentType = response.headers?.get?.('content-type') || '';
  const bodyText = await response.text();

  if (!bodyText) {
    if (response.ok) {
      return null;
    }

    throw buildError(fallbackMessage);
  }

  const isJsonContentType = contentType.includes('application/json') || contentType.includes('+json');
  if (!isJsonContentType) {
    const htmlHint = bodyText.trim().startsWith('<')
      ? ' El servidor devolvio HTML; revisa que la URL solicitada apunte al recurso JSON esperado.'
      : '';

    throw buildError(`${fallbackMessage}${htmlHint}`);
  }

  const data = JSON.parse(bodyText);
  if (!response.ok) {
    throw buildError(data?.error || fallbackMessage, data);
  }

  return data;
}

export { readJsonResponse };
