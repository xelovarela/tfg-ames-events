/**
 * Este archivo centraliza la persistencia de sesion en el frontend.
 * Guarda y recupera token y usuario autenticado desde localStorage para
 * mantener la sesion entre recargas sin anadir dependencias externas.
 */
const AUTH_STORAGE_KEY = 'ames_events_auth_session';

function setAuthSession(session) {
  if (!session || !session.token || !session.user) {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function getAuthSession() {
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession);
    if (!parsedSession?.token || !parsedSession?.user) {
      return null;
    }

    return parsedSession;
  } catch (error) {
    return null;
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getAuthToken() {
  const session = getAuthSession();
  return session?.token || null;
}

export {
  setAuthSession,
  getAuthSession,
  clearAuthSession,
  getAuthToken
};
