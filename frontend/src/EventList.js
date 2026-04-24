/**
 * Este archivo implementa el listado reutilizable de eventos.
 * Puede cargar sus propios datos o recibirlos ya preparados, y ofrece acciones
 * para editar, borrar y navegar al detalle de cada evento.
 */
import React, { useEffect, useState } from 'react';
import { Baby, Building2, Heart, MapPin, Users } from 'lucide-react';
import { API_BASE_URL } from './config';
import { Link, useNavigate } from 'react-router-dom';
import { withAuthHeaders } from './utils/authFetch';
import { getEventImageUrl } from './utils/eventImages';

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
  return `${event.min_age}-${event.max_age} anos`;
}

function formatShortDate(value) {
  if (!value) {
    return {
      day: '--',
      month: 'Sin fecha',
      time: ''
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      day: '--',
      month: 'Sin fecha',
      time: ''
    };
  }

  return {
    day: date.toLocaleDateString('es-ES', { day: '2-digit' }),
    month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
    time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
}

function buildDescriptionPreview(description) {
  if (!description) {
    return 'Sin descripcion ampliada por ahora.';
  }

  return description.length > 150 ? `${description.slice(0, 147)}...` : description;
}

function IconLocation() {
  return <MapPin aria-hidden="true" focusable="false" />;
}

function IconOrganizer() {
  return <Building2 aria-hidden="true" focusable="false" />;
}

function IconAudience() {
  return <Users aria-hidden="true" focusable="false" />;
}

function IconAge() {
  return <Baby aria-hidden="true" focusable="false" />;
}

function IconHeart() {
  return <Heart aria-hidden="true" focusable="false" />;
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
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const favoriteIdsSet = new Set((favoriteEventIds || []).map((id) => Number(id)));
  const isControlled = Array.isArray(externalEvents);

  // En modo no controlado el propio componente recupera los eventos desde la API.
  const loadEvents = () => {
    fetch(`${API_BASE_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
          setLoadError('');
          return;
        }

        console.error('Unexpected /events response:', data);
        setEvents([]);
        setLoadError(data?.error || 'No se pudieron cargar los eventos.');
      })
      .catch((err) => {
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

  const handleOpenDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleCardKeyDown = (keyboardEvent, eventId) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      handleOpenDetails(eventId);
    }
  };

  void onEditEvent;

  return (
    <section className="event-list-panel">
      <div className="event-list-header">
        <div>
          <p className="event-list-kicker">Agenda</p>
          <h3>Lista de eventos</h3>
        </div>
        <span className="event-list-count">{events.length} eventos</span>
      </div>

      {loadError && (
        <p className="event-list-error">
          {loadError}
        </p>
      )}

      {/* Estado vacio y renderizado de tarjetas individuales de evento. */}
      {events.length === 0 && showEmptyState ? (
        <div className="event-list-empty">
          <strong>No hay eventos para mostrar</strong>
          <span>{emptyMessage}</span>
        </div>
      ) : events.length > 0 ? (
        <div className="event-list-grid">
          {events.map((event) => {
            const shortDate = formatShortDate(event.event_date);
            const isFavorite = favoriteIdsSet.has(Number(event.id));

            return (
              <article
                key={event.id}
                className="event-list-card"
                role="link"
                tabIndex={0}
                onClick={() => handleOpenDetails(event.id)}
                onKeyDown={(keyboardEvent) => handleCardKeyDown(keyboardEvent, event.id)}
                aria-label={`Ver detalle de ${event.title}`}
              >
                <Link to={`/events/${event.id}`} className="event-list-image-link" aria-label={`Ver detalle de ${event.title}`}>
                  <img src={getEventImageUrl(event)} alt="" className="event-list-image" loading="lazy" />
                  <div className="event-list-date event-list-date-overlay" aria-label={`Fecha: ${formatDate(event.event_date)}`}>
                    <strong>{shortDate.day}</strong>
                    <span>{shortDate.month}</span>
                    {shortDate.time && <small>{shortDate.time}</small>}
                  </div>
                </Link>

                <div className="event-list-card-body">
                  <div className="event-list-card-top">
                    <span className="event-list-chip">{event.category || 'Sin categoria'}</span>
                    <span className="event-list-chip event-list-chip-soft">{formatPrice(event)}</span>
                  </div>

                  <h4>
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                  </h4>

                  <p className="event-list-description">{buildDescriptionPreview(event.description)}</p>

                  <dl className="event-list-meta">
                    <div>
                      <dt><span className="event-list-meta-title-icon" title="Ubicacion"><IconLocation /></span></dt>
                      <dd>{event.location || 'No especificada'}</dd>
                    </div>
                    <div>
                      <dt><span className="event-list-meta-title-icon" title="Organiza"><IconOrganizer /></span></dt>
                      <dd>{event.organizer || 'No especificado'}</dd>
                    </div>
                    <div>
                      <dt><span className="event-list-meta-title-icon" title="Audiencia"><IconAudience /></span></dt>
                      <dd>{event.audience || 'General'}</dd>
                    </div>
                    <div>
                      <dt><span className="event-list-meta-title-icon" title="Edad"><IconAge /></span></dt>
                      <dd>{formatAgeRange(event)}</dd>
                    </div>
                  </dl>

                  <div className="event-list-actions">
                    <Link to={`/events/${event.id}`} className="event-list-primary-link">
                      Ver detalle
                    </Link>

                    {showFavoriteButton && (
                      <button
                        type="button"
                        className={`event-list-favorite-btn${isFavorite ? ' active' : ''}`}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          handleToggleFavorite(event.id, isFavorite);
                        }}
                        aria-label={isFavorite ? 'Quitar de favoritos' : 'Anadir a favoritos'}
                        title={isFavorite ? 'Quitar de favoritos' : 'Anadir a favoritos'}
                      >
                        <span className="event-list-favorite-icon" aria-hidden="true"><IconHeart /></span>
                      </button>
                    )}

                    {canManageEvents && (
                      <>
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="event-list-action-btn"
                          onClick={(clickEvent) => clickEvent.stopPropagation()}
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          className="event-list-action-btn event-list-action-danger"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            handleDelete(event.id);
                          }}
                        >
                          Borrar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default EventList;
