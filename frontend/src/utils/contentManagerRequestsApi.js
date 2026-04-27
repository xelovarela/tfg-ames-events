import { API_BASE_URL } from '../config';
import { withAuthHeaders } from './authFetch';
import { readJsonResponse } from './http';

async function readJsonOrThrow(response, fallbackMessage) {
  return readJsonResponse(response, fallbackMessage);
}

async function createContentManagerRequest(payload) {
  const response = await fetch(`${API_BASE_URL}/content-manager-requests`, {
    method: 'POST',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return readJsonOrThrow(response, 'No se pudo enviar la solicitud.');
}

async function listMyContentManagerRequests() {
  const response = await fetch(`${API_BASE_URL}/content-manager-requests/me`, {
    headers: withAuthHeaders()
  });

  const data = await readJsonOrThrow(response, 'No se pudieron cargar tus solicitudes.');
  return Array.isArray(data?.requests) ? data.requests : [];
}

async function listContentManagerRequests(status = 'pending') {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }

  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/content-manager-requests${query ? `?${query}` : ''}`,
    { headers: withAuthHeaders() }
  );

  const data = await readJsonOrThrow(response, 'No se pudieron cargar las solicitudes.');
  return Array.isArray(data?.requests) ? data.requests : [];
}

async function reviewContentManagerRequest(requestId, payload) {
  const response = await fetch(`${API_BASE_URL}/content-manager-requests/${requestId}/review`, {
    method: 'PATCH',
    headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });

  return readJsonOrThrow(response, 'No se pudo revisar la solicitud.');
}

export {
  createContentManagerRequest,
  listMyContentManagerRequests,
  listContentManagerRequests,
  reviewContentManagerRequest
};
