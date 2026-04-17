/**
 * Gestor de administracion de usuarios.
 * Permite a admin consultar usuarios, cambiar roles y activar/desactivar cuentas.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
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
  const [roles, setRoles] = useState([]);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);
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
    </section>
  );
}

export default UserManager;
