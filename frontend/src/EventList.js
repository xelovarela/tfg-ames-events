/**
 * Este archivo implementa el listado reutilizable de eventos.
 * Puede cargar sus propios datos o recibirlos ya preparados, y ofrece acciones
 * para editar, borrar y navegar al detalle de cada evento.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { Link } from 'react-router-dom';
import { withAuthHeaders } from './utils/authFetch';

// Convierte la fecha tecnica del backend a un formato legible.
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

// Muestra si el evento es gratis o cuanto cuesta.
function formatPrice(event) {
  if (Number(event.is_free) === 1) {
    return 'Gratis';
  }
  if (event.price === null || event.price === undefined) {
    return 'De pago';
  }
  return `${Number(event.price).toFixed(2)} EUR`;
}

// Resume el rango de edad admitido por el evento.
function formatAgeRange(event) {
  if (event.min_age === null || event.max_age === null) {
    return 'Todas las edades';
  }
  return `${event.min_age}-${event.max_age} anios`;
}

// El componente admite modo controlado para reutilizarlo con eventos ya filtrados.
const EventList = ({
  refreshTrigger,
  onEditEvent,
  events: externalEvents,
  onEventDeleted,
  favoriteEventIds = [],
  onToggleFavorite,
  showFavoriteButton = false,
  canManageEvents = false,
  emptyMessage = 'No hay eventos registrados.',
  showEmptyState = true
}) => {
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const favoriteIdsSet = new Set((favoriteEventIds || []).map((id) => Number(id)));
  const isControlled = Array.isArray(externalEvents);

  // En modo no controlado el propio componente recupera los eventos desde la API.
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

  // Si el componente no recibe eventos externos, se carga el listado al montarse.
  useEffect(() => {
    if (isControlled) {
      return;
    }
    loadEvents();
  }, [refreshTrigger, isControlled]);

  // Si recibe eventos desde fuera, se sincroniza el estado interno con esas props.
  useEffect(() => {
    if (!isControlled) {
      return;
    }

    setEvents(externalEvents);
    setLoadError('');
  }, [externalEvents, isControlled]);

  // El borrado pide confirmacion y despues actualiza el listado visible.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres borrar este evento?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
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

  const handleToggleFavorite = async (eventId, isFavorite) => {
    if (!onToggleFavorite) {
      return;
    }

    try {
      await onToggleFavorite(eventId, isFavorite);
    } catch (error) {
      console.error(error);
      alert(error.message || 'No se pudo actualizar el favorito.');
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

      {/* Estado vacio y renderizado de tarjetas individuales de evento. */}
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
              {showFavoriteButton && (
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(event.id, favoriteIdsSet.has(Number(event.id)))}
                  style={{ padding: '0.4rem 0.8rem', cursor: 'pointer', marginRight: '0.5rem' }}
                >
                  {favoriteIdsSet.has(Number(event.id)) ? 'Quitar favorito' : 'Favorito'}
                </button>
              )}

              {canManageEvents && (
                <>
                  <Link to={`/events/${event.id}/edit`} style={{ marginRight: '0.5rem' }}>
                    <button
                      type="button"
                      style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDelete(event.id)}
                    style={{ padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                  >
                    Borrar
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      ) : null
      }
    </div>
  );
};

export default EventList;
