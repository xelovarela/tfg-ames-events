/**
 * Este archivo implementa el listado reutilizable de eventos.
 * Puede cargar sus propios datos o recibirlos ya preparados, y ofrece acciones
 * para editar, borrar y navegar al detalle de cada evento.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Copy, Heart, MapPin, Users } from 'lucide-react';
import { API_BASE_URL } from './config';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { withAuthHeaders } from './utils/authFetch';
import { getEventImageAlt, getEventImageUrl } from './utils/eventImages';
import { isPastEvent, parseEventDate } from './utils/eventTime';
import { readJsonResponse } from './utils/http';

// Convierte la fecha tecnica del backend a un formato legible.
function formatDate(value) {
  if (!value) {
    return 'Sin fecha';
  }
  const date = parseEventDate(value);
  if (!date) {
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

function formatShortDate(value) {
  if (!value) {
    return {
      day: '--',
      month: 'Sin fecha',
      time: ''
    };
  }

  const date = parseEventDate(value);
  if (!date) {
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
    return 'Sin descripción ampliada por ahora.';
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

function IconHeart() {
  return <Heart aria-hidden="true" focusable="false" />;
}

function IconCopy() {
  return <Copy aria-hidden="true" focusable="false" />;
}

const EVENTS_PER_PAGE = 9;

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
  showEmptyState = true,
  kicker = 'Agenda',
  title = 'Lista de eventos'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const favoriteIdsSet = new Set((favoriteEventIds || []).map((id) => Number(id)));
  const isControlled = Array.isArray(externalEvents);
  const totalPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * EVENTS_PER_PAGE;
  const pageEndIndex = Math.min(pageStartIndex + EVENTS_PER_PAGE, events.length);
  const visibleEvents = useMemo(
    () => events.slice(pageStartIndex, pageEndIndex),
    [events, pageEndIndex, pageStartIndex]
  );

  // En modo no controlado el propio componente recupera los eventos desde la API.
  const loadEvents = () => {
    fetch(`${API_BASE_URL}/events`)
      .then((res) => readJsonResponse(res, 'No se pudieron cargar los eventos.'))
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
        setLoadError(err.message || 'No se pudieron cargar los eventos.');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [events]);

  // El borrado pide confirmación y después actualiza el listado visible.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres borrar este evento?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });

      await readJsonResponse(response, 'Error deleting event');

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

  const detailBackState = {
    from: `${location.pathname}${location.search}`,
    fromLabel: location.pathname.startsWith('/favorites') ? 'favoritos' : 'listado'
  };

  const handleOpenDetails = (eventId) => {
    navigate(`/events/${eventId}`, { state: detailBackState });
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
          <p className="event-list-kicker">{kicker}</p>
          <h3>{title}</h3>
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
        <>
        <div className="event-list-grid">
          {visibleEvents.map((event) => {
            const shortDate = formatShortDate(event.event_date);
            const isFavorite = favoriteIdsSet.has(Number(event.id));
            const favoriteCount = Number(event.favorite_count);
            const isPast = isPastEvent(event);

            return (
              <article
                key={event.id}
                className={`event-list-card${isPast ? ' is-past' : ''}`}
                role="link"
                tabIndex={0}
                onClick={() => handleOpenDetails(event.id)}
                onKeyDown={(keyboardEvent) => handleCardKeyDown(keyboardEvent, event.id)}
                aria-label={`Ver detalle de ${event.title}`}
              >
                <Link
                  to={`/events/${event.id}`}
                  state={detailBackState}
                  className="event-list-image-link"
                  aria-label={`Ver detalle de ${event.title}`}
                >
                  <img src={getEventImageUrl(event)} alt={getEventImageAlt(event)} className="event-list-image" loading="lazy" />
                  <div className="event-list-date event-list-date-overlay" aria-label={`Fecha: ${formatDate(event.event_date)}`}>
                    <strong>{shortDate.day}</strong>
                    <span>{shortDate.month}</span>
                    {shortDate.time && <small>{shortDate.time}</small>}
                  </div>
                  <div className="event-list-card-top event-list-card-top-overlay">
                    <span className="event-list-chip">{event.category || 'Sin categoría'}</span>
                    <span className="event-list-chip event-list-chip-soft">{formatPrice(event)}</span>
                    {isPast && <span className="event-list-chip event-list-chip-ended">Finalizado</span>}
                  </div>
                  {favoriteCount > 0 && (
                    <div className="event-list-popularity" aria-label={`${favoriteCount} favs`}>
                      <Heart aria-hidden="true" focusable="false" />
                      <span>{favoriteCount === 1 ? '1 fav' : `${favoriteCount} favs`}</span>
                    </div>
                  )}
                </Link>

                <div className="event-list-card-body">
                  <h4>
                    <Link to={`/events/${event.id}`} state={detailBackState}>{event.title}</Link>
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
                  </dl>

                  {(showFavoriteButton || canManageEvents) && (
                    <div className="event-list-actions">
                      {canManageEvents && (
                        <>
                          <Link
                            to={`/events/new?duplicateFrom=${event.id}`}
                            className="event-list-action-btn"
                            onClick={(clickEvent) => clickEvent.stopPropagation()}
                          >
                            <span className="event-list-action-icon" aria-hidden="true"><IconCopy /></span>
                            Duplicar
                          </Link>

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
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {events.length > EVENTS_PER_PAGE && (
          <nav className="event-list-pagination" aria-label="Paginacion de eventos">
            <span>
              Mostrando {pageStartIndex + 1}-{pageEndIndex} de {events.length}
            </span>
            <div>
              <button
                type="button"
                className="event-list-page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={activePage === 1}
              >
                Anterior
              </button>
              <span className="event-list-page-status">
                Pagina {activePage} de {totalPages}
              </span>
              <button
                type="button"
                className="event-list-page-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={activePage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
        </>
      ) : null}
    </section>
  );
};

export default EventList;
