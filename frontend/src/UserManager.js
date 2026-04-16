/**
 * Este archivo implementa el gestor CRUD de usuarios.
 * Permite listar usuarios, crear y editar con seleccion de rol
 * y actualizar contrasena solo cuando se informa un nuevo valor.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
import './UserManager.css';

const initialForm = {
  username: '',
  email: '',
  password: '',
  role_id: ''
};

function validateUser(form, isEditing) {
  const username = form.username.trim();
  const email = form.email.trim();
  const password = form.password;
  const roleId = Number(form.role_id);

  if (!username || username.length > 100) {
    return 'El username es obligatorio y debe tener entre 1 y 100 caracteres.';
  }

  if (!email || email.length > 100) {
    return 'El email es obligatorio y debe tener entre 1 y 100 caracteres.';
  }

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return 'Debes seleccionar un rol valido.';
  }

  if (!isEditing && (!password || password.length < 6)) {
    return 'La contraseña es obligatoria y debe tener al menos 6 caracteres.';
  }

  if (isEditing && password && password.length < 6) {
    return 'Si indicas una nueva contraseña, debe tener al menos 6 caracteres.';
  }

  return null;
}

function UserManager() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const selectedRole = roles.find((role) => String(role.id) === formData.role_id);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: withAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los usuarios');
      }
      setUsers(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar los usuarios');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: withAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los roles');
      }
      setRoles(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar los roles');
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role_id: String(user.role_id)
    });
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationError = validateUser(formData, Boolean(editingId));
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      role_id: Number(formData.role_id)
    };

    if (!editingId || formData.password) {
      payload.password = formData.password;
    }

    const endpoint = editingId
      ? `${API_BASE_URL}/users/${editingId}`
      : `${API_BASE_URL}/users`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: withAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando usuario');
      }

      setMessage(editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      clearForm();
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar este usuario?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando usuario');
      }

      setMessage('Usuario eliminado correctamente.');
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando usuario');
    }
  };

  return (
    <section className="users-card">
      <h3 className="users-title">Gestion de usuarios</h3>

      <form className="users-form" onSubmit={handleSubmit}>
        <input
          className="users-input"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <input
          className="users-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <select
          className="users-input"
          name="role_id"
          value={formData.role_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <input
          className="users-input"
          type="password"
          name="password"
          placeholder={editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          value={formData.password}
          onChange={handleChange}
          minLength={editingId ? undefined : 6}
          required={!editingId}
        />

        <p className="users-role-help">
          {selectedRole
            ? `Descripcion del rol: ${selectedRole.description || 'Sin descripcion disponible.'}`
            : 'Selecciona un rol para ver su descripcion.'}
        </p>

        <div className="users-actions">
          <button className="users-btn users-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear usuario'}
          </button>
          {editingId && (
            <button className="users-btn users-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="users-message">{message}</p>}

      <div className="users-list">
        {users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          users.map((user) => (
            <article className="users-item" key={user.id}>
              <strong>{user.username}</strong>
              <p>Email: {user.email}</p>
              <p>Rol: {user.role}</p>
              <div className="users-item-actions">
                <button className="users-btn users-btn-secondary" onClick={() => handleEdit(user)}>
                  Editar
                </button>
                <button className="users-btn users-btn-danger" onClick={() => handleDelete(user.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default UserManager;
