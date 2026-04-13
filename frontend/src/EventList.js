import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';

function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(event) {
  if (Number(event.is_free) === 1) {
    return 'Gratis';
  }
  if (event.price === null || event.price === undefined) {
    return 'De pago';
  }
  return `${Number(event.price).toFixed(2)} EUR`;
}

function formatAgeRange(event) {
  if (event.min_age === null || event.max_age === null) {
    return 'Todas las edades';
  }
  return `${event.min_age}-${event.max_age} anios`;
}

const EventList = ({
  refreshTrigger,
  onEditEvent,
  events: externalEvents,
  onEventDeleted,
  emptyMessage = 'No hay eventos registrados.',
  showEmptyState = true
}) => {
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const isControlled = Array.isArray(externalEvents);

  const loadEvents = () => {
    fetch(`${API_BASE_URL}/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
          setLoadError('');
          return;
        }

        console.error('Unexpected /events response:', data);
        setEvents([]);
        setLoadError(data?.error || 'No se pudieron cargar los eventos.');
      })
      .catch(err => {
        console.error('Error loading events:', err);
        setEvents([]);
        setLoadError('No se pudieron cargar los eventos.');
      });
  };

  useEffect(() => {
    if (isControlled) {
      return;
    }
    loadEvents();
  }, [refreshTrigger, isControlled]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    setEvents(externalEvents);
    setLoadError('');
  }, [externalEvents, isControlled]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres borrar este evento?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error deleting event');
      }

      if (onEventDeleted) {
        onEventDeleted();
      } else if (!isControlled) {
        loadEvents();
      }
    } catch (error) {
      console.error(error);
      alert('Error al borrar el evento');
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>Lista de eventos</h3>

      {loadError && (
        <p style={{ color: '#a94442', marginBottom: '0.75rem' }}>
          {loadError}
        </p>
      )}

      {events.length === 0 && showEmptyState ? (
        <p>{emptyMessage}</p>
      ) : events.length > 0 ? (
        events.map(event => (
          <div
            key={event.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              background: '#fff'
            }}
          >
            <strong>{event.title}</strong>
            <br />
            Descripcion: {event.description || 'Sin descripcion'}
            <br />
            Categoria: {event.category}
            <br />
            Audiencia: {event.audience || 'General'}
            <br />
            Organizador: {event.organizer || 'No especificado'}
            <br />
            Ubicacion: {event.location}
            <br />
            Fecha: {formatDate(event.event_date)}
            <br />
            Precio: {formatPrice(event)}
            <br />
            Edad: {formatAgeRange(event)}
            <br />
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={() => onEditEvent && onEditEvent(event.id)}
                style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(event.id)}
                style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
              >
                Borrar
              </button>
            </div>
          </div>
        ))
      ) : null
      }
    </div>
  );
};

export default EventList;
