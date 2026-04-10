import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './LocationManager.css';

const initialForm = {
  name: '',
  lat: '',
  lng: ''
};

function validateLocation(form) {
  const name = form.name.trim();
  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (!name || name.length > 150) {
    return 'El nombre es obligatorio y debe tener entre 1 y 150 caracteres.';
  }

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return 'Latitud invalida. Debe estar entre -90 y 90.';
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return 'Longitud invalida. Debe estar entre -180 y 180.';
  }

  return null;
}

function LocationManager({ onLocationsChanged }) {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las ubicaciones');
      }
      setLocations(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadLocations();
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

    const validationError = validateLocation(formData);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      name: formData.name.trim(),
      lat: Number(formData.lat),
      lng: Number(formData.lng)
    };

    const endpoint = editingId
      ? `${API_BASE_URL}/locations/${editingId}`
      : `${API_BASE_URL}/locations`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando ubicacion');
      }

      setMessage(editingId ? 'Ubicacion actualizada correctamente.' : 'Ubicacion creada correctamente.');
      clearForm();
      await loadLocations();
      if (onLocationsChanged) {
        onLocationsChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando ubicacion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (location) => {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      lat: String(location.lat),
      lng: String(location.lng)
    });
    setMessage('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta ubicacion?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando ubicacion');
      }

      setMessage('Ubicacion eliminada correctamente.');
      await loadLocations();
      if (onLocationsChanged) {
        onLocationsChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando ubicacion');
    }
  };

  return (
    <section className="locations-card">
      <h3 className="locations-title">Gestion de ubicaciones</h3>

      <form className="locations-form" onSubmit={handleSubmit}>
        <input
          className="locations-input"
          type="text"
          name="name"
          placeholder="Nombre de la ubicacion"
          value={formData.name}
          onChange={handleChange}
          maxLength={150}
          required
        />

        <input
          className="locations-input"
          type="number"
          name="lat"
          placeholder="Latitud"
          step="0.0000001"
          value={formData.lat}
          onChange={handleChange}
          required
        />

        <input
          className="locations-input"
          type="number"
          name="lng"
          placeholder="Longitud"
          step="0.0000001"
          value={formData.lng}
          onChange={handleChange}
          required
        />

        <div className="locations-actions">
          <button className="locations-btn locations-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear ubicacion'}
          </button>

          {editingId && (
            <button className="locations-btn locations-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="locations-message">{message}</p>}

      <div className="locations-list">
        {locations.length === 0 ? (
          <p>No hay ubicaciones registradas.</p>
        ) : (
          locations.map((location) => (
            <article className="locations-item" key={location.id}>
              <strong>{location.name}</strong>
              <p>Lat: {location.lat}</p>
              <p>Lng: {location.lng}</p>
              <div className="locations-item-actions">
                <button className="locations-btn locations-btn-secondary" onClick={() => handleEdit(location)}>
                  Editar
                </button>
                <button className="locations-btn locations-btn-danger" onClick={() => handleDelete(location.id)}>
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

export default LocationManager;
