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

const EventList = ({ refreshTrigger, onEditEvent }) => {
  const [events, setEvents] = useState([]);

  const loadEvents = () => {
    fetch(`${API_BASE_URL}/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error loading events:', err));
  };

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

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

      loadEvents();
    } catch (error) {
      console.error(error);
      alert('Error al borrar el evento');
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>Lista de eventos</h3>

      {events.length === 0 ? (
        <p>No hay eventos registrados.</p>
      ) : (
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
            Categoria: {event.category}
            <br />
            Audiencia: {event.audience || 'General'}
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
                onClick={() => onEditEvent(event.id)}
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
      )}
    </div>
  );
};

export default EventList;
