import { API_BASE_URL } from '../config';
import { withAuthHeaders } from './authFetch';
import { clearAuthSession } from './authStorage';

async function readJsonOrThrow(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Tu sesion ha expirado. Vuelve a iniciar sesion.');
    }

    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

async function listFavorites() {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    headers: withAuthHeaders()
  });

  return readJsonOrThrow(response, 'No se pudieron cargar los favoritos');
}

async function listFavoriteIds() {
  const response = await fetch(`${API_BASE_URL}/favorites/ids`, {
    headers: withAuthHeaders()
  });

  const data = await readJsonOrThrow(response, 'No se pudieron cargar los ids de favoritos');
  return Array.isArray(data?.event_ids) ? data.event_ids : [];
}

async function addFavorite(eventId) {
  const response = await fetch(`${API_BASE_URL}/favorites/${eventId}`, {
    method: 'POST',
    headers: withAuthHeaders()
  });

  return readJsonOrThrow(response, 'No se pudo guardar el favorito');
}

async function removeFavorite(eventId) {
  const response = await fetch(`${API_BASE_URL}/favorites/${eventId}`, {
    method: 'DELETE',
    headers: withAuthHeaders()
  });

  return readJsonOrThrow(response, 'No se pudo eliminar el favorito');
}

export {
  listFavorites,
  listFavoriteIds,
  addFavorite,
  removeFavorite
};
