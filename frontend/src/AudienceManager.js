/**
 * Este archivo implementa el gestor de audiencias del frontend.
 * Permite mantener el catalogo de tipos de publico y su rango de edad asociado
 * con validaciones de cliente antes de llamar a la API.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './AudienceManager.css';

// Estado base del formulario de audiencias.
const initialForm = {
  name: '',
  age_min: '',
  age_max: ''
};

// Valida nombre y rango de edad antes de enviar datos al backend.
function validateAudience(form) {
  const name = form.name.trim();
  const ageMin = form.age_min === '' ? null : Number(form.age_min);
  const ageMax = form.age_max === '' ? null : Number(form.age_max);

  if (!name || name.length > 100) {
    return 'El nombre es obligatorio y debe tener entre 1 y 100 caracteres.';
  }

  if ((ageMin === null && ageMax !== null) || (ageMin !== null && ageMax === null)) {
    return 'Debes indicar edad minima y maxima juntas.';
  }

  if (
    ageMin !== null &&
    ageMax !== null &&
    (!Number.isInteger(ageMin) || !Number.isInteger(ageMax) || ageMin < 0 || ageMax < 0 || ageMin > ageMax)
  ) {
    return 'Rango de edad invalido.';
  }

  return null;
}

// Este componente concentra la logica CRUD de audiencias.
function AudienceManager({ onAudiencesChanged }) {
  const [audiences, setAudiences] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Recupera la lista completa de audiencias desde la API.
  const loadAudiences = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/audiences`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las audiencias');
      }
      setAudiences(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // La carga inicial se realiza al montar el componente.
  useEffect(() => {
    loadAudiences();
  }, []);

  // Mantiene sincronizados los inputs del formulario con el estado local.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Limpia el formulario y desactiva la edicion.
  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  // Crea o actualiza audiencias segun el estado actual del formulario.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationError = validateAudience(formData);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      name: formData.name.trim(),
      age_min: formData.age_min === '' ? null : Number(formData.age_min),
      age_max: formData.age_max === '' ? null : Number(formData.age_max)
    };

    const endpoint = editingId
      ? `${API_BASE_URL}/audiences/${editingId}`
      : `${API_BASE_URL}/audiences`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando audiencia');
      }

      setMessage(editingId ? 'Audiencia actualizada correctamente.' : 'Audiencia creada correctamente.');
      clearForm();
      await loadAudiences();
      if (onAudiencesChanged) {
        onAudiencesChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando audiencia');
    } finally {
      setIsSaving(false);
    }
  };

  // Carga en el formulario los datos de una audiencia ya existente.
  const handleEdit = (audience) => {
    setEditingId(audience.id);
    setFormData({
      name: audience.name,
      age_min: audience.age_min === null || audience.age_min === undefined ? '' : String(audience.age_min),
      age_max: audience.age_max === null || audience.age_max === undefined ? '' : String(audience.age_max)
    });
    setMessage('');
  };

  // Elimina una audiencia previa confirmacion del usuario.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta audiencia?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/audiences/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando audiencia');
      }

      setMessage('Audiencia eliminada correctamente.');
      await loadAudiences();
      if (onAudiencesChanged) {
        onAudiencesChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando audiencia');
    }
  };

  return (
    <section className="audiences-card">
      <h3 className="audiences-title">Gestion de audiencias</h3>

      {/* Formulario principal para crear o editar audiencias. */}
      <form className="audiences-form" onSubmit={handleSubmit}>
        <input
          className="audiences-input"
          type="text"
          name="name"
          placeholder="Nombre de la audiencia"
          value={formData.name}
          onChange={handleChange}
          maxLength={100}
          required
        />

        <input
          className="audiences-input"
          type="number"
          name="age_min"
          placeholder="Edad minima"
          min="0"
          step="1"
          value={formData.age_min}
          onChange={handleChange}
        />

        <input
          className="audiences-input"
          type="number"
          name="age_max"
          placeholder="Edad maxima"
          min="0"
          step="1"
          value={formData.age_max}
          onChange={handleChange}
        />

        <div className="audiences-actions">
          <button className="audiences-btn audiences-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear audiencia'}
          </button>

          {editingId && (
            <button className="audiences-btn audiences-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="audiences-message">{message}</p>}

      <div className="audiences-list">
        {audiences.length === 0 ? (
          <p>No hay audiencias registradas.</p>
        ) : (
          audiences.map((audience) => (
            <article className="audiences-item" key={audience.id}>
              <strong>{audience.name}</strong>
              <p>
                Edad:{' '}
                {audience.age_min === null || audience.age_max === null
                  ? 'Sin rango especifico'
                  : `${audience.age_min}-${audience.age_max}`}
              </p>
              <div className="audiences-item-actions">
                <button className="audiences-btn audiences-btn-secondary" onClick={() => handleEdit(audience)}>
                  Editar
                </button>
                <button className="audiences-btn audiences-btn-danger" onClick={() => handleDelete(audience.id)}>
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

export default AudienceManager;
