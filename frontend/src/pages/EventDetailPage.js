/**
 * Este archivo define la pagina de detalle de un evento.
 * Recupera un registro concreto desde la API, formatea sus datos para presentacion
 * y muestra una ficha legible con su informacion principal.
 */
import React, { useEffect, useState } from 'react';
import { Baby, Building2, CalendarClock, CalendarPlus, Heart, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { addFavorite, listFavoriteIds, removeFavorite } from '../utils/favoritesApi';
import { getEventImageUrl } from '../utils/eventImages';

const DETAIL_TEXT = {
  title: 'Detalle del evento',
  backMap: 'Volver al mapa',
  backEvents: 'Ver todos los eventos',
  loading: 'Cargando evento...',
  when: 'Cu\u00e1ndo',
  where: 'D\u00f3nde',
  forWho: 'Para qui\u00e9n',
  organizer: 'Organiza',
  description: 'Descripci\u00f3n',
  location: 'Ubicaci\u00f3n',
  categoryFallback: 'Sin categor\u00eda',
  locationFallback: 'Ubicaci\u00f3n no especificada',
  organizerFallback: 'Organizador no especificado',
  audienceFallback: 'Audiencia general',
  favoriteSaved: 'A\u00f1adido a favoritos',
  favoriteSave: 'A\u00f1adir a favoritos',
  favoriteLoading: 'Actualizando...',
  addToCalendar: 'A\u00f1adir al calendario',
  editEvent: 'Editar evento',
  viewOnMap: 'Ver esta ubicaci\u00f3n en el mapa',
  quickSummary: 'Resumen r\u00e1pido'
};

// Separa dia y hora para que la cabecera pueda destacar mejor la fecha.
function formatDateParts(value) {
  if (!value) {
    return {
      day: 'Sin fecha',
      time: 'Hora no indicada'
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      day: 'Sin fecha',
      time: 'Hora no indicada'
    };
  }

  return {
    day: date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
    time: date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

function formatDateBadgeParts(value) {
  if (!value) {
    return {
      day: '--',
      month: 'SIN FECHA',
      time: '--:--'
    };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      day: '--',
      month: 'SIN FECHA',
      time: '--:--'
    };
  }

  return {
    day: date.toLocaleDateString('es-ES', { day: '2-digit' }),
    month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
    time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
}

// Presenta el precio respetando si el evento es gratuito o de pago.
function formatPrice(event) {
  if (Number(event.is_free) === 1) {
    return 'Gratis';
  }

  if (event.price === null || event.price === undefined) {
    return 'De pago';
  }

  return `${Number(event.price).toFixed(2)} EUR`;
}

// Construye un texto amigable para el rango de edad del evento.
function formatAgeRange(event) {
  if (event.min_age === null || event.max_age === null) {
    return 'Todas las edades';
  }

  return `${event.min_age}-${event.max_age} a\u00f1os`;
}

function IconCalendarClock() {
  return <CalendarClock aria-hidden="true" focusable="false" />;
}

function IconLocation() {
  return <MapPin aria-hidden="true" focusable="false" />;
}

function IconAudience() {
  return <Baby aria-hidden="true" focusable="false" />;
}

function IconOrganizer() {
  return <Building2 aria-hidden="true" focusable="false" />;
}

function IconHeart() {
  return <Heart aria-hidden="true" focusable="false" />;
}

function IconCalendarPlus() {
  return <CalendarPlus aria-hidden="true" focusable="false" />;
}

function formatCalendarDateLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function buildGoogleCalendarUrl(event) {
  if (!event?.event_date) {
    return '';
  }

  const startDate = new Date(event.event_date);
  if (Number.isNaN(startDate.getTime())) {
    return '';
  }

  // Duracion por defecto para eventos sin hora de fin almacenada.
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const start = formatCalendarDateLocal(startDate);
  const end = formatCalendarDateLocal(endDate);
  if (!start || !end) {
    return '';
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || DETAIL_TEXT.title,
    dates: `${start}/${end}`
  });

  const details = [
    event.description ? event.description.trim() : '',
    event.organizer ? `Organiza: ${event.organizer}` : ''
  ].filter(Boolean).join('\n\n');

  if (details) {
    params.set('details', details);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timeZone) {
    params.set('ctz', timeZone);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildMapLocationUrl(event) {
  const params = new URLSearchParams();
  if (event?.location_locality) {
    params.set('locality', event.location_locality);
  } else if (event?.location) {
    params.set('search', event.location);
  } else if (event?.title) {
    params.set('search', event.title);
  }

  const query = params.toString();
  return query ? `/map?${query}` : '/map';
}

// Este componente carga el evento indicado en la ruta y muestra su detalle.
function EventDetailPage({ session }) {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const isAuthenticated = Boolean(session?.token);
  const canUseFavorites = ['user', 'admin'].includes(session?.user?.role);
  const canManageEvents = ['admin', 'content_manager'].includes(session?.user?.role);
  const dateParts = event ? formatDateParts(event.event_date) : null;
  const dateBadge = event ? formatDateBadgeParts(event.event_date) : null;
  const googleCalendarUrl = event ? buildGoogleCalendarUrl(event) : '';

  // Al cambiar el id de la URL se vuelve a pedir el evento correspondiente.
  useEffect(() => {
    let isMounted = true;

    const loadEvent = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'No se pudo cargar el evento');
        }

        if (isMounted) {
          setEvent(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (isMounted) {
          setEvent(null);
          setError(loadError.message || 'No se pudo cargar el evento');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteState = async () => {
      if (!isAuthenticated || !canUseFavorites) {
        if (isMounted) {
          setIsFavorite(false);
        }
        return;
      }

      try {
        const ids = await listFavoriteIds();
        if (isMounted) {
          setIsFavorite(ids.includes(Number(id)));
        }
      } catch (loadError) {
        console.error(loadError);
      }
    };

    loadFavoriteState();
    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, canUseFavorites]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !canUseFavorites || !event || isFavoriteLoading) {
      return;
    }

    setIsFavoriteLoading(true);
    setFavoriteMessage('');

    try {
      if (isFavorite) {
        await removeFavorite(event.id);
        setIsFavorite(false);
        setFavoriteMessage('Evento eliminado de favoritos.');
      } else {
        await addFavorite(event.id);
        setIsFavorite(true);
        setFavoriteMessage('Evento guardado en favoritos.');
      }
    } catch (toggleError) {
      console.error(toggleError);
      setFavoriteMessage(toggleError.message || 'No se pudo actualizar el favorito.');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!googleCalendarUrl) {
      return;
    }
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="event-detail-page">
      <div className="event-detail-nav">
        <Link to="/map" className="event-detail-back-link">{DETAIL_TEXT.backMap}</Link>
        <Link to="/events" className="event-detail-back-link">{DETAIL_TEXT.backEvents}</Link>
      </div>

      {loading && <p className="event-detail-loading">{DETAIL_TEXT.loading}</p>}

      {!loading && error && (
        <div className="event-detail-card event-detail-error-card">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && event && (
        <section className="event-detail-card">
          <div className="event-detail-layout">
            <div className="event-detail-head">
              <aside className="event-detail-date-inline" aria-label={DETAIL_TEXT.when}>
                <span className="event-detail-date-icon"><IconCalendarClock /></span>
                <strong>{dateBadge.day}</strong>
                <span>{dateBadge.month}</span>
                <small>{dateBadge.time}</small>
              </aside>

              <p className="event-detail-kicker">{DETAIL_TEXT.title}</p>
              <h2>{event.title}</h2>

              <div className="event-detail-head-actions">
                {canManageEvents && (
                  <Link to={`/events/${event.id}/edit`} className="event-detail-calendar-btn">
                    {DETAIL_TEXT.editEvent}
                  </Link>
                )}

                <button
                  type="button"
                  className="event-detail-calendar-btn"
                  onClick={handleAddToCalendar}
                  disabled={!googleCalendarUrl}
                >
                  <span className="event-detail-calendar-icon" aria-hidden="true"><IconCalendarPlus /></span>
                  {DETAIL_TEXT.addToCalendar}
                </button>

                {canUseFavorites && (
                  <button
                    type="button"
                    className={`event-detail-favorite-btn${isFavorite ? ' active' : ''}`}
                    onClick={handleToggleFavorite}
                    disabled={isFavoriteLoading}
                  >
                    <span className="event-detail-favorite-icon" aria-hidden="true"><IconHeart /></span>
                    {isFavoriteLoading
                      ? DETAIL_TEXT.favoriteLoading
                      : isFavorite
                        ? DETAIL_TEXT.favoriteSaved
                        : DETAIL_TEXT.favoriteSave}
                  </button>
                )}
              </div>

              <div className="event-detail-tags">
                <span className="event-detail-tag event-detail-tag-strong">{event.category || DETAIL_TEXT.categoryFallback}</span>
                <span className="event-detail-tag">{event.audience || DETAIL_TEXT.audienceFallback}</span>
                <span className="event-detail-tag">{formatPrice(event)}</span>
                {event.location_locality && <span className="event-detail-tag">{event.location_locality}</span>}
              </div>
            </div>

            <div className="event-detail-media">
              <img src={getEventImageUrl(event)} alt="" className="event-detail-image" />
            </div>

            <div className="event-detail-side">
              <div className="event-detail-panels">
                <aside className="event-detail-summary" aria-label={DETAIL_TEXT.quickSummary}>
                  <h3>{DETAIL_TEXT.quickSummary}</h3>
                  <div className="event-detail-grid">
                    <article className="event-detail-block">
                      <h4><span className="event-detail-block-icon"><IconCalendarClock /></span>{DETAIL_TEXT.when}</h4>
                      <p>{dateParts.day}</p>
                      <p>{dateParts.time}</p>
                    </article>

                    <article className="event-detail-block">
					  <h4><span className="event-detail-block-icon"><IconLocation /></span>{DETAIL_TEXT.where}</h4>
					  <p>{event.location || DETAIL_TEXT.locationFallback}</p>
					  {event.location_locality && <p>({event.location_locality})</p>}
					</article>

                    <article className="event-detail-block">
                      <h4><span className="event-detail-block-icon"><IconOrganizer /></span>{DETAIL_TEXT.organizer}</h4>
                      <p>{event.organizer || DETAIL_TEXT.organizerFallback}</p>
                    </article>

                    <article className="event-detail-block">
                      <h4><span className="event-detail-block-icon"><IconAudience /></span>{DETAIL_TEXT.forWho}</h4>
                      <p>{formatAgeRange(event)}</p>
                    </article>
                  </div>
                </aside>

                <article className="event-detail-description">
                  <h3>{DETAIL_TEXT.description}</h3>
                  <p>{event.description || 'Este evento todavia no tiene una descripcion ampliada.'}</p>
                </article>
              </div>
            </div>
          </div>

          {favoriteMessage && <p className="event-detail-message">{favoriteMessage}</p>}

          <div className="event-detail-map-cta">
            <div>
              <strong>{event.location || DETAIL_TEXT.locationFallback}</strong>
              <span>
                {event.lat && event.lng
                  ? `Coordenadas: ${event.lat}, ${event.lng}`
                  : 'Consulta el mapa para ver los eventos cercanos.'}
              </span>
            </div>
            <Link to={buildMapLocationUrl(event)} className="event-detail-map-link">
              {DETAIL_TEXT.viewOnMap}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default EventDetailPage;
