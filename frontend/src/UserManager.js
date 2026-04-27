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
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
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
    loadManagerRequests();
  }, []);

  const loadManagerRequests = async () => {
    try {
      const data = await listContentManagerRequests('pending');
      setManagerRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar las solicitudes de gestor.');
    }
  };

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
      const data = await reviewContentManagerRequest(request.id, { status: nextStatus });
      setManagerRequests((current) => current.filter((item) => Number(item.id) !== Number(request.id)));
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

      <h3 className="users-title users-title-secondary">Solicitudes para gestor de contenido</h3>

      {managerRequests.length === 0 ? (
        <p>No hay solicitudes pendientes.</p>
      ) : (
        <div className="users-requests-list">
          {managerRequests.map((request) => {
            const isReviewing = Number(reviewingRequestId) === Number(request.id);

            return (
              <article key={request.id} className="users-request-card">
                <div className="users-request-head">
                  <strong>{request.username || 'Usuario'}</strong>
                  <span>{request.email}</span>
                </div>
                <p><strong>Propuesta:</strong> {request.proposal_title}</p>
                <p>{request.proposal_description}</p>
                {request.organization_name && <p><strong>Entidad:</strong> {request.organization_name}</p>}
                {request.phone && <p><strong>Telefono:</strong> {request.phone}</p>}
                <p><strong>Enviada:</strong> {formatDate(request.created_at)}</p>

                <div className="users-request-actions">
                  <button
                    type="button"
                    className="users-btn users-btn-approve"
                    onClick={() => handleReviewRequest(request, 'approved')}
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserManager;
