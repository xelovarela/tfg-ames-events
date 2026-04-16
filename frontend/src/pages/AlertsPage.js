/**
 * Pagina de alertas de eventos del usuario autenticado.
 * Permite crear filtros guardados y gestionarlos sin salir del patron visual actual.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { withAuthHeaders } from '../utils/authFetch';
import './AlertsPage.css';

const initialForm = {
  name: '',
  category_id: '',
  location_id: '',
  audience_id: '',
  min_age: '',
  max_age: '',
  keyword: '',
  is_active: true
};

async function readJsonOrThrow(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

function validateAlertForm(form) {
  const name = form.name.trim();
  const keyword = form.keyword.trim();
  const minAge = form.min_age === '' ? null : Number(form.min_age);
  const maxAge = form.max_age === '' ? null : Number(form.max_age);

  if (!name || name.length > 100) {
    return 'El nombre es obligatorio y debe tener como maximo 100 caracteres.';
  }

  if (keyword.length > 150) {
    return 'La palabra clave debe tener como maximo 150 caracteres.';
  }

  if (form.min_age !== '' && (!Number.isInteger(minAge) || minAge <= 0)) {
    return 'La edad minima debe ser un entero positivo.';
  }

  if (form.max_age !== '' && (!Number.isInteger(maxAge) || maxAge <= 0)) {
    return 'La edad maxima debe ser un entero positivo.';
  }

  if (minAge !== null && maxAge !== null && minAge > maxAge) {
    return 'La edad minima no puede ser mayor que la maxima.';
  }

  const hasCriteria = Boolean(
    form.category_id ||
    form.location_id ||
    form.audience_id ||
    form.min_age ||
    form.max_age ||
    keyword
  );

  if (!hasCriteria) {
    return 'Define al menos un criterio para la alerta.';
  }

  return null;
}

function buildPayload(form) {
  return {
    name: form.name.trim(),
    category_id: form.category_id ? Number(form.category_id) : null,
    location_id: form.location_id ? Number(form.location_id) : null,
    audience_id: form.audience_id ? Number(form.audience_id) : null,
    min_age: form.min_age ? Number(form.min_age) : null,
    max_age: form.max_age ? Number(form.max_age) : null,
    keyword: form.keyword.trim() || null,
    is_active: form.is_active
  };
}

function describeCriteria(alert) {
  const parts = [];

  if (alert.category) parts.push(`Categoria: ${alert.category}`);
  if (alert.location) parts.push(`Ubicacion: ${alert.location}`);
  if (alert.audience) parts.push(`Audiencia: ${alert.audience}`);
  if (alert.min_age !== null) parts.push(`Desde ${alert.min_age} anios`);
  if (alert.max_age !== null) parts.push(`Hasta ${alert.max_age} anios`);
  if (alert.keyword) parts.push(`Texto: "${alert.keyword}"`);

  return parts.join(' · ');
}

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
        headers: withAuthHeaders()
      });
      const data = await readJsonOrThrow(response, 'No se pudieron cargar tus alertas');
      setAlerts(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setAlerts([]);
      setLoadError(error.message || 'No se pudieron cargar tus alertas');
    }
  };

  const loadCatalogs = async () => {
    try {
      const [categoriesRes, locationsRes, audiencesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/locations`),
        fetch(`${API_BASE_URL}/audiences`)
      ]);

      const [categoriesData, locationsData, audiencesData] = await Promise.all([
        readJsonOrThrow(categoriesRes, 'No se pudieron cargar las categorias'),
        readJsonOrThrow(locationsRes, 'No se pudieron cargar las ubicaciones'),
        readJsonOrThrow(audiencesRes, 'No se pudieron cargar las audiencias')
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLocations(Array.isArray(locationsData) ? locationsData : []);
      setAudiences(Array.isArray(audiencesData) ? audiencesData : []);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudieron cargar los catalogos');
    }
  };

  useEffect(() => {
    loadAlerts();
    loadCatalogs();
  }, []);

  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationError = validateAlertForm(formData);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const endpoint = editingId
      ? `${API_BASE_URL}/alerts/${editingId}`
      : `${API_BASE_URL}/alerts`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(buildPayload(formData))
      });
      await readJsonOrThrow(response, 'No se pudo guardar la alerta');

      setMessage(editingId ? 'Alerta actualizada correctamente.' : 'Alerta creada correctamente.');
      clearForm();
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo guardar la alerta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (alert) => {
    setEditingId(alert.id);
    setFormData({
      name: alert.name || '',
      category_id: alert.category_id ? String(alert.category_id) : '',
      location_id: alert.location_id ? String(alert.location_id) : '',
      audience_id: alert.audience_id ? String(alert.audience_id) : '',
      min_age: alert.min_age !== null ? String(alert.min_age) : '',
      max_age: alert.max_age !== null ? String(alert.max_age) : '',
      keyword: alert.keyword || '',
      is_active: Boolean(alert.is_active)
    });
    setMessage('');
  };

  const handleStatusToggle = async (alert) => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alert.id}/status`, {
        method: 'PATCH',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ is_active: !alert.is_active })
      });
      await readJsonOrThrow(response, 'No se pudo actualizar el estado de la alerta');
      setMessage(!alert.is_active ? 'Alerta activada correctamente.' : 'Alerta desactivada correctamente.');
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo actualizar el estado de la alerta');
    }
  };

  const handleDelete = async (alertId) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta alerta?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });
      await readJsonOrThrow(response, 'No se pudo eliminar la alerta');
      setMessage('Alerta eliminada correctamente.');
      if (Number(editingId) === Number(alertId)) {
        clearForm();
      }
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo eliminar la alerta');
    }
  };

  return (
    <main>
      <h2>Mis Alertas</h2>

      <section className="alerts-card">
        <h3 className="alerts-title">{editingId ? 'Editar alerta' : 'Nueva alerta'}</h3>

        <form className="alerts-form" onSubmit={handleSubmit}>
          <input
            className="alerts-input"
            type="text"
            name="name"
            placeholder="Nombre de la alerta"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <select className="alerts-input" name="category_id" value={formData.category_id} onChange={handleChange}>
            <option value="">Cualquier categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <select className="alerts-input" name="location_id" value={formData.location_id} onChange={handleChange}>
            <option value="">Cualquier ubicacion</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>

          <select className="alerts-input" name="audience_id" value={formData.audience_id} onChange={handleChange}>
            <option value="">Cualquier audiencia</option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>{audience.name}</option>
            ))}
          </select>

          <input
            className="alerts-input"
            type="number"
            name="min_age"
            placeholder="Edad minima"
            min="1"
            value={formData.min_age}
            onChange={handleChange}
          />

          <input
            className="alerts-input"
            type="number"
            name="max_age"
            placeholder="Edad maxima"
            min="1"
            value={formData.max_age}
            onChange={handleChange}
          />

          <input
            className="alerts-input"
            type="text"
            name="keyword"
            placeholder="Palabra clave"
            value={formData.keyword}
            onChange={handleChange}
            maxLength={150}
          />

          <label className="alerts-checkbox">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Activa
          </label>

          <div className="alerts-actions">
            <button className="alerts-btn alerts-btn-primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear alerta'}
            </button>
            {editingId && (
              <button className="alerts-btn alerts-btn-secondary" type="button" onClick={clearForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {message && <p className="alerts-message">{message}</p>}
        {loadError && <p className="alerts-message alerts-message-error">{loadError}</p>}
      </section>

      <section className="alerts-card">
        <h3 className="alerts-title">Alertas guardadas</h3>

        {alerts.length === 0 && !loadError ? (
          <p>No tienes alertas guardadas todavia.</p>
        ) : (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <article className="alerts-item" key={alert.id}>
                <div>
                  <strong>{alert.name}</strong>
                  <p>{describeCriteria(alert)}</p>
                  <span className={alert.is_active ? 'alerts-badge alerts-badge-ok' : 'alerts-badge alerts-badge-muted'}>
                    {alert.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                <div className="alerts-item-actions">
                  <button className="alerts-btn alerts-btn-secondary" type="button" onClick={() => handleEdit(alert)}>
                    Editar
                  </button>
                  <button className="alerts-btn alerts-btn-secondary" type="button" onClick={() => handleStatusToggle(alert)}>
                    {alert.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="alerts-btn alerts-btn-danger" type="button" onClick={() => handleDelete(alert.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AlertsPage;
