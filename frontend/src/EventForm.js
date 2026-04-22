/**
 * Este archivo implementa el formulario reutilizable de eventos.
 * Sirve tanto para crear como para editar, carga catalogos auxiliares, valida los
 * datos en cliente y envia el payload final al backend.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
import { getEventImageUrl } from './utils/eventImages';
import './EventForm.css';

// Estado inicial del formulario para altas o reseteos.
const initialFormData = {
  title: '',
  description: '',
  event_date: '',
  is_free: '1',
  price: '',
  min_age: '',
  max_age: '',
  audience_id: '',
  organizer_id: '',
  category_id: '',
  location_id: ''
};

// Convierte la fecha del backend al formato que espera un input datetime-local.
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

// Este componente encapsula toda la logica del formulario de creacion y edicion.
const EventForm = ({
  onEventCreated,
  eventToEdit,
  onEditFinished,
  locationRefreshTrigger = 0,
  categoryRefreshTrigger = 0,
  audienceRefreshTrigger = 0,
  organizerRefreshTrigger = 0
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Al montar o refrescar catalogos se cargan las opciones de selects auxiliares.
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/categories`).then(res => res.json()),
      fetch(`${API_BASE_URL}/locations`).then(res => res.json()),
      fetch(`${API_BASE_URL}/audiences`).then(res => res.json()),
      fetch(`${API_BASE_URL}/organizers`).then(res => res.json())
    ])
      .then(([categoriesData, locationsData, audiencesData, organizersData]) => {
        setCategories(categoriesData);
        setLocations(locationsData);
        setAudiences(audiencesData);
        setOrganizers(organizersData);
      })
      .catch(err => console.error('Error loading form data:', err));
  }, [locationRefreshTrigger, categoryRefreshTrigger, audienceRefreshTrigger, organizerRefreshTrigger]);

  // Si llega un evento para editar, el formulario se rellena con sus valores actuales.
  useEffect(() => {
    if (!eventToEdit) {
      return;
    }

    setFormData({
      title: eventToEdit.title || '',
      description: eventToEdit.description || '',
      event_date: toDateTimeLocalInput(eventToEdit.event_date),
      is_free: String(eventToEdit.is_free ?? 1),
      price: eventToEdit.price !== null && eventToEdit.price !== undefined ? String(eventToEdit.price) : '',
      min_age: eventToEdit.min_age !== null && eventToEdit.min_age !== undefined ? String(eventToEdit.min_age) : '',
      max_age: eventToEdit.max_age !== null && eventToEdit.max_age !== undefined ? String(eventToEdit.max_age) : '',
      audience_id: eventToEdit.audience_id ? String(eventToEdit.audience_id) : '',
      organizer_id: eventToEdit.organizer_id ? String(eventToEdit.organizer_id) : '',
      category_id: eventToEdit.category_id ? String(eventToEdit.category_id) : '',
      location_id: eventToEdit.location_id ? String(eventToEdit.location_id) : ''
    });
    setImageFile(null);
    setImagePreview(getEventImageUrl(eventToEdit));
    setMessage('');
  }, [eventToEdit]);

  // Actualiza el estado local cuando cambia cualquier campo del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (eventToEdit ? getEventImageUrl(eventToEdit) : ''));
  };

  // Devuelve el formulario a su estado base despues de guardar o cancelar.
  const resetForm = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setImagePreview('');
  };

  // Valida, construye el payload final y lo envia al endpoint adecuado.
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

    const payload = new FormData();
    payload.append('title', trimmedTitle);
    payload.append('description', formData.description.trim() || '');
    payload.append('event_date', formData.event_date || '');
    payload.append('is_free', isFree ? '1' : '0');
    payload.append('price', isFree || price === null ? '' : String(price));
    payload.append('min_age', minAge === null ? '' : String(minAge));
    payload.append('max_age', maxAge === null ? '' : String(maxAge));
    payload.append('audience_id', formData.audience_id === '' ? '' : String(Number(formData.audience_id)));
    payload.append('organizer_id', formData.organizer_id === '' ? '' : String(Number(formData.organizer_id)));
    payload.append('category_id', String(Number(formData.category_id)));
    payload.append('location_id', String(Number(formData.location_id)));

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      const endpoint = eventToEdit
        ? `${API_BASE_URL}/events/${eventToEdit.id}`
        : `${API_BASE_URL}/events`;

      const method = eventToEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: withAuthHeaders(),
        body: payload
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

  // En modo edicion permite salir sin guardar y limpiar el formulario.
  const handleCancelEdit = () => {
    resetForm();
    setMessage('');
    if (onEditFinished) onEditFinished();
  };

  return (
    <section className="event-form-card">
      <h3 className="event-form-title">{eventToEdit ? 'Editar evento' : 'Crear nuevo evento'}</h3>

      {/* Formulario principal con campos basicos, precio opcional y relaciones auxiliares. */}
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

        <label className="event-form-label" htmlFor="description">Descripcion</label>
        <textarea
          id="description"
          className="event-form-input"
          name="description"
          placeholder="Describe brevemente en que consiste el evento"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          maxLength={2000}
        />

        <label className="event-form-label" htmlFor="image">Imagen del evento (opcional)</label>
        <input
          id="image"
          className="event-form-input"
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
        />
        <p className="event-form-help">Si no subes una imagen, se mostrara una imagen por defecto.</p>

        {imagePreview && (
          <div className="event-form-image-preview">
            <img src={imagePreview} alt="Vista previa del evento" />
          </div>
        )}

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

        <label className="event-form-label" htmlFor="audience_id">Audiencia</label>
        <select
          id="audience_id"
          className="event-form-input"
          name="audience_id"
          value={formData.audience_id}
          onChange={handleChange}
        >
          <option value="">Sin audiencia especifica</option>
          {audiences.map(audience => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>

        <label className="event-form-label" htmlFor="organizer_id">Organizador</label>
        <select
          id="organizer_id"
          className="event-form-input"
          name="organizer_id"
          value={formData.organizer_id}
          onChange={handleChange}
        >
          <option value="">Sin organizador especifico</option>
          {organizers.map(organizer => (
            <option key={organizer.id} value={organizer.id}>
              {organizer.name}
            </option>
          ))}
        </select>

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
