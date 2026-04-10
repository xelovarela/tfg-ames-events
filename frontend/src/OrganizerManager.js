import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './OrganizerManager.css';

const initialForm = {
  name: '',
  email: '',
  phone: ''
};

function validateOrganizer(form) {
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!name || name.length > 100) {
    return 'El nombre es obligatorio y debe tener entre 1 y 100 caracteres.';
  }

  if (email.length > 100) {
    return 'El email no puede superar los 100 caracteres.';
  }

  if (phone.length > 30) {
    return 'El telefono no puede superar los 30 caracteres.';
  }

  return null;
}

function OrganizerManager({ onOrganizersChanged }) {
  const [organizers, setOrganizers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadOrganizers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizers`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los organizadores');
      }
      setOrganizers(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadOrganizers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationError = validateOrganizer(formData);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      phone: formData.phone.trim() === '' ? null : formData.phone.trim()
    };

    const endpoint = editingId
      ? `${API_BASE_URL}/organizers/${editingId}`
      : `${API_BASE_URL}/organizers`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando organizador');
      }

      setMessage(editingId ? 'Organizador actualizado correctamente.' : 'Organizador creado correctamente.');
      clearForm();
      await loadOrganizers();
      if (onOrganizersChanged) {
        onOrganizersChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando organizador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (organizer) => {
    setEditingId(organizer.id);
    setFormData({
      name: organizer.name,
      email: organizer.email || '',
      phone: organizer.phone || ''
    });
    setMessage('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar este organizador?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizers/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando organizador');
      }

      setMessage('Organizador eliminado correctamente.');
      await loadOrganizers();
      if (onOrganizersChanged) {
        onOrganizersChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando organizador');
    }
  };

  return (
    <section className="organizers-card">
      <h3 className="organizers-title">Gestion de organizadores</h3>

      <form className="organizers-form" onSubmit={handleSubmit}>
        <input
          className="organizers-input"
          type="text"
          name="name"
          placeholder="Nombre del organizador"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <input
          className="organizers-input"
          type="email"
          name="email"
          placeholder="Email (opcional)"
          value={formData.email}
          onChange={handleChange}
          maxLength={100}
        />

        <input
          className="organizers-input"
          type="text"
          name="phone"
          placeholder="Telefono (opcional)"
          value={formData.phone}
          onChange={handleChange}
          maxLength={30}
        />

        <div className="organizers-actions">
          <button className="organizers-btn organizers-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear organizador'}
          </button>

          {editingId && (
            <button className="organizers-btn organizers-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="organizers-message">{message}</p>}

      <div className="organizers-list">
        {organizers.length === 0 ? (
          <p>No hay organizadores registrados.</p>
        ) : (
          organizers.map((organizer) => (
            <article className="organizers-item" key={organizer.id}>
              <strong>{organizer.name}</strong>
              <p>Email: {organizer.email || 'No especificado'}</p>
              <p>Telefono: {organizer.phone || 'No especificado'}</p>
              <div className="organizers-item-actions">
                <button className="organizers-btn organizers-btn-secondary" onClick={() => handleEdit(organizer)}>
                  Editar
                </button>
                <button className="organizers-btn organizers-btn-danger" onClick={() => handleDelete(organizer.id)}>
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

export default OrganizerManager;
