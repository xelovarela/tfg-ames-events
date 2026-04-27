/**
 * Gestor de administracion de usuarios.
 * Permite a admin consultar usuarios, cambiar roles y activar/desactivar cuentas.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
import {
  listContentManagerRequests,
  reviewContentManagerRequest
} from './utils/contentManagerRequestsApi';
import './UserManager.css';

const ROLE_LABELS = {
  admin: 'Admin',
  content_manager: 'Gestor de contenido',
  user: 'Usuario'
};

function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

const REQUEST_FILTERS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: '', label: 'Todas' }
];

const REQUEST_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada'
};

async function readJsonOrThrow(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

function UserManager({ session }) {
  const [users, setUsers] = useState([]);
  const [managerRequests, setManagerRequests] = useState([]);
  const [managerRequestStatus, setManagerRequestStatus] = useState('pending');
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [requestNotes, setRequestNotes] = useState({});
  const currentUserId = Number(session?.user?.id);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: withAuthHeaders()
      });
      const data = await readJsonOrThrow(response, 'No se pudieron cargar los usuarios');
      setUsers(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setUsers([]);
      setLoadError(error.message || 'No se pudieron cargar los usuarios');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: withAuthHeaders()
      });
      const data = await readJsonOrThrow(response, 'No se pudieron cargar los roles');
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar los roles');
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadManagerRequests = async () => {
    try {
      const data = await listContentManagerRequests(managerRequestStatus);
      setManagerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar las solicitudes de gestor.');
    }
  };

  useEffect(() => {
    loadManagerRequests();
  }, [managerRequestStatus]);

  const updateUserInList = (updatedUser) => {
    setUsers((currentUsers) => currentUsers.map((user) => (
      Number(user.id) === Number(updatedUser.id) ? updatedUser : user
    )));
  };

  const handleRoleChange = async (user, nextRole) => {
    if (Number(user.id) === currentUserId && nextRole !== 'admin') {
      setMessage('No puedes quitarte tu propio rol de administrador.');
      return;
    }

    setSavingUserId(user.id);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/role`, {
        method: 'PATCH',
        headers: withAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ role: nextRole })
      });
      const data = await readJsonOrThrow(response, 'No se pudo actualizar el rol');
      updateUserInList(data.user);
      setMessage('Rol actualizado correctamente.');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo actualizar el rol');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextIsActive = !user.is_active;

    if (Number(user.id) === currentUserId && !nextIsActive) {
      setMessage('No puedes desactivar tu propia cuenta.');
      return;
    }

    setSavingUserId(user.id);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/status`, {
        method: 'PATCH',
        headers: withAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ is_active: nextIsActive })
      });
      const data = await readJsonOrThrow(response, 'No se pudo actualizar el estado');
      updateUserInList(data.user);
      setMessage(nextIsActive ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo actualizar el estado');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleReviewRequest = async (request, nextStatus) => {
    if (reviewingRequestId) {
      return;
    }

    setReviewingRequestId(request.id);
    setMessage('');

    try {
      const data = await reviewContentManagerRequest(request.id, {
        status: nextStatus,
        admin_notes: requestNotes[request.id] || ''
      });
      setManagerRequests((current) => current.filter((item) => Number(item.id) !== Number(request.id)));
      setRequestNotes((current) => {
        const nextNotes = { ...current };
        delete nextNotes[request.id];
        return nextNotes;
      });
      setMessage(data?.message || 'Solicitud revisada correctamente.');
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo revisar la solicitud.');
    } finally {
      setReviewingRequestId(null);
    }
  };

  return (
    <section className="users-card">
      <h3 className="users-title">Usuarios registrados</h3>

      {message && <p className="users-message">{message}</p>}
      {loadError && <p className="users-message users-message-error">{loadError}</p>}

      {users.length === 0 && !loadError ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Email</th>
                <th>Alta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = Number(user.id) === currentUserId;
                const isSaving = Number(savingUserId) === Number(user.id);

                return (
                  <tr key={user.id}>
                    <td>{user.username || 'Sin usuario'}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        className="users-select"
                        value={user.role}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                        disabled={isSaving || (isSelf && user.role === 'admin')}
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {ROLE_LABELS[role.name] || role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={user.is_active ? 'users-badge users-badge-ok' : 'users-badge users-badge-muted'}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{user.email_verified ? 'Verificado' : 'Pendiente'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className={user.is_active ? 'users-btn users-btn-secondary' : 'users-btn users-btn-primary'}
                        onClick={() => handleStatusToggle(user)}
                        disabled={isSaving || (isSelf && user.is_active)}
                      >
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="users-title-row">
        <h3 className="users-title users-title-secondary">Solicitudes de acceso como creador de contenido</h3>
        <select
          className="users-select users-request-filter"
          value={managerRequestStatus}
          onChange={(event) => setManagerRequestStatus(event.target.value)}
          aria-label="Filtrar solicitudes"
        >
          {REQUEST_FILTERS.map((filter) => (
            <option key={filter.value || 'all'} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {managerRequests.length === 0 ? (
        <p>No hay solicitudes para el filtro seleccionado.</p>
      ) : (
        <div className="users-requests-list">
          {managerRequests.map((request) => {
            const isReviewing = Number(reviewingRequestId) === Number(request.id);
            const isPending = request.status === 'pending';

            return (
              <article key={request.id} className="users-request-card">
                <div className="users-request-head">
                  <div>
                    <strong>{request.username || 'Usuario'}</strong>
                    <span>{request.email}</span>
                  </div>
                  <span className={`users-request-status users-request-status-${request.status || 'pending'}`}>
                    {REQUEST_STATUS_LABELS[request.status] || request.status || 'Pendiente'}
                  </span>
                </div>
                <p><strong>Asunto:</strong> {request.proposal_title}</p>
                <p><strong>Motivación:</strong> {request.proposal_description}</p>
                {request.organization_name && <p><strong>Entidad/Organización:</strong> {request.organization_name}</p>}
                {request.phone && <p><strong>Teléfono:</strong> {request.phone}</p>}
                <p><strong>Solicitado:</strong> {formatDate(request.created_at)}</p>
                {request.reviewed_by_username && (
                  <p><strong>Revisado por:</strong> {request.reviewed_by_username} ({formatDate(request.reviewed_at)})</p>
                )}
                {request.admin_notes && <p><strong>Notas:</strong> {request.admin_notes}</p>}

                {isPending && (
                  <>
                    <label className="users-request-note-label" htmlFor={`request-note-${request.id}`}>
                      Notas de revisión
                    </label>
                    <textarea
                      id={`request-note-${request.id}`}
                      className="users-request-note"
                      value={requestNotes[request.id] || ''}
                      onChange={(event) => setRequestNotes((current) => ({
                        ...current,
                        [request.id]: event.target.value
                      }))}
                      rows={3}
                      maxLength={500}
                    />

                    <div className="users-request-actions">
                      <button
                        type="button"
                        className="users-btn users-btn-approve"
                        onClick={() => {
                          if (window.confirm('Al aprobar esta solicitud, el usuario obtendrá permisos para crear y editar eventos. ¿Continuar?')) {
                            handleReviewRequest(request, 'approved');
                          }
                        }}
                        disabled={isReviewing}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        className="users-btn users-btn-secondary"
                        onClick={() => handleReviewRequest(request, 'rejected')}
                        disabled={isReviewing}
                      >
                        Rechazar
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserManager;
