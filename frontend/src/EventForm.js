import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './EventForm.css';

const initialFormData = {
  title: '',
  event_date: '',
  is_free: '1',
  price: '',
  min_age: '',
  max_age: '',
  category_id: '',
  location_id: ''
};

function toDateTimeLocalInput(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const EventForm = ({
  onEventCreated,
  eventToEdit,
  onEditFinished,
  locationRefreshTrigger = 0,
  categoryRefreshTrigger = 0
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/categories`).then(res => res.json()),
      fetch(`${API_BASE_URL}/locations`).then(res => res.json())
    ])
      .then(([categoriesData, locationsData]) => {
        setCategories(categoriesData);
        setLocations(locationsData);
      })
      .catch(err => console.error('Error loading form data:', err));
  }, [locationRefreshTrigger, categoryRefreshTrigger]);

  useEffect(() => {
    if (!eventToEdit) {
      return;
    }

    setFormData({
      title: eventToEdit.title || '',
      event_date: toDateTimeLocalInput(eventToEdit.event_date),
      is_free: String(eventToEdit.is_free ?? 1),
      price: eventToEdit.price !== null && eventToEdit.price !== undefined ? String(eventToEdit.price) : '',
      min_age: eventToEdit.min_age !== null && eventToEdit.min_age !== undefined ? String(eventToEdit.min_age) : '',
      max_age: eventToEdit.max_age !== null && eventToEdit.max_age !== undefined ? String(eventToEdit.max_age) : '',
      category_id: eventToEdit.category_id ? String(eventToEdit.category_id) : '',
      location_id: eventToEdit.location_id ? String(eventToEdit.location_id) : ''
    });
    setMessage('');
  }, [eventToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle || !formData.category_id || !formData.location_id) {
      setMessage('Completa todos los campos obligatorios.');
      return;
    }

    const isFree = Number(formData.is_free) === 1;
    const minAge = formData.min_age === '' ? null : Number(formData.min_age);
    const maxAge = formData.max_age === '' ? null : Number(formData.max_age);
    const price = formData.price === '' ? null : Number(formData.price);

    if (!isFree && (price === null || Number.isNaN(price) || price <= 0)) {
      setMessage('Para eventos de pago debes indicar un precio mayor que 0.');
      return;
    }

    if ((minAge === null && maxAge !== null) || (minAge !== null && maxAge === null)) {
      setMessage('Debes indicar edad minima y maxima juntas.');
      return;
    }

    if (
      minAge !== null &&
      maxAge !== null &&
      (!Number.isInteger(minAge) || !Number.isInteger(maxAge) || minAge <= 0 || maxAge <= 0 || minAge > maxAge)
    ) {
      setMessage('Rango de edad invalido.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      title: trimmedTitle,
      event_date: formData.event_date || null,
      is_free: isFree ? 1 : 0,
      price: isFree ? null : price,
      min_age: minAge,
      max_age: maxAge,
      category_id: Number(formData.category_id),
      location_id: Number(formData.location_id)
    };

    try {
      const endpoint = eventToEdit
        ? `${API_BASE_URL}/events/${eventToEdit.id}`
        : `${API_BASE_URL}/events`;

      const method = eventToEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error saving event');
      }

      setMessage(eventToEdit ? 'Evento actualizado correctamente' : 'Evento creado correctamente');
      resetForm();
      if (onEditFinished) onEditFinished();
      if (onEventCreated) onEventCreated();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error al guardar el evento');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage('');
    if (onEditFinished) onEditFinished();
  };

  return (
    <section className="event-form-card">
      <h3 className="event-form-title">{eventToEdit ? 'Editar evento' : 'Crear nuevo evento'}</h3>

      <form className="event-form" onSubmit={handleSubmit}>
        <label className="event-form-label" htmlFor="title">Titulo</label>
        <input
          id="title"
          className="event-form-input"
          type="text"
          name="title"
          placeholder="Ej: Taller de pintura"
          value={formData.title}
          onChange={handleChange}
          maxLength={150}
          required
        />

        <label className="event-form-label" htmlFor="event_date">Fecha y hora</label>
        <input
          id="event_date"
          className="event-form-input"
          type="datetime-local"
          name="event_date"
          value={formData.event_date}
          onChange={handleChange}
        />

        <label className="event-form-label" htmlFor="is_free">Tipo</label>
        <select
          id="is_free"
          className="event-form-input"
          name="is_free"
          value={formData.is_free}
          onChange={handleChange}
          required
        >
          <option value="1">Gratis</option>
          <option value="0">De pago</option>
        </select>

        {formData.is_free === '0' && (
          <>
            <label className="event-form-label" htmlFor="price">Precio (EUR)</label>
            <input
              id="price"
              className="event-form-input"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="Ej: 5.00"
              required
            />
          </>
        )}

        <div className="event-form-age-grid">
          <div>
            <label className="event-form-label" htmlFor="min_age">Edad minima</label>
            <input
              id="min_age"
              className="event-form-input"
              type="number"
              name="min_age"
              value={formData.min_age}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Ej: 4"
            />
          </div>

          <div>
            <label className="event-form-label" htmlFor="max_age">Edad maxima</label>
            <input
              id="max_age"
              className="event-form-input"
              type="number"
              name="max_age"
              value={formData.max_age}
              onChange={handleChange}
              min="1"
              step="1"
              placeholder="Ej: 12"
            />
          </div>
        </div>

        <label className="event-form-label" htmlFor="category_id">Categoria</label>
        <select
          id="category_id"
          className="event-form-input"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una categoria</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label className="event-form-label" htmlFor="location_id">Ubicacion</label>
        <select
          id="location_id"
          className="event-form-input"
          name="location_id"
          value={formData.location_id}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una ubicacion</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        <div className="event-form-actions">
          <button className="event-btn event-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : eventToEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>

          {eventToEdit && (
            <button className="event-btn event-btn-secondary" type="button" onClick={handleCancelEdit}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="event-form-message">{message}</p>}
    </section>
  );
};

export default EventForm;
