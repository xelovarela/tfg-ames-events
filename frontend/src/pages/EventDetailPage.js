/**
 * Este archivo define la pagina de detalle de un evento.
 * Recupera un registro concreto desde la API, formatea sus datos para presentacion
 * y muestra una ficha legible con su informacion principal.
 */
import React, { useEffect, useState } from 'react';
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
  favoriteSaved: 'Guardado en favoritos',
  favoriteSave: 'Guardar en favoritos',
  favoriteLoading: 'Actualizando...',
  viewOnMap: 'Ver esta ubicaci\u00f3n en el mapa',
  quickSummary: 'Resumen r\u00e1pido'
};

// Convierte la fecha almacenada en base de datos a un formato legible para el usuario.
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
  const canUseFavorites = session?.user?.role === 'user';
  const dateParts = event ? formatDateParts(event.event_date) : null;

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
          {/* Tarjeta principal que agrupa la informacion relevante del evento. */}
          <div className="event-detail-hero">
            <div className="event-detail-hero-copy">
              <p className="event-detail-kicker">{DETAIL_TEXT.title}</p>
              <h2>{event.title}</h2>
              <div className="event-detail-tags">
                <span className="event-detail-tag event-detail-tag-strong">{event.category || DETAIL_TEXT.categoryFallback}</span>
                <span className="event-detail-tag">{event.audience || DETAIL_TEXT.audienceFallback}</span>
                <span className="event-detail-tag">{formatPrice(event)}</span>
              </div>
            </div>

            <aside className="event-detail-date-card" aria-label={DETAIL_TEXT.when}>
              <span>{dateParts.day}</span>
              <strong>{dateParts.time}</strong>
            </aside>
          </div>

          <div className="event-detail-image-wrap">
            <img src={getEventImageUrl(event)} alt="" className="event-detail-image" />
          </div>

          <div className="event-detail-action-row">
            <div>
              <span className="event-detail-action-label">{DETAIL_TEXT.location}</span>
              <strong>{event.location || DETAIL_TEXT.locationFallback}</strong>
            </div>

            {canUseFavorites && (
              <button
                type="button"
                className={`event-detail-favorite-btn${isFavorite ? ' active' : ''}`}
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
              >
                {isFavoriteLoading
                  ? DETAIL_TEXT.favoriteLoading
                  : isFavorite
                    ? DETAIL_TEXT.favoriteSaved
                    : DETAIL_TEXT.favoriteSave}
              </button>
            )}
          </div>

          {favoriteMessage && <p className="event-detail-message">{favoriteMessage}</p>}

          <div className="event-detail-content-grid">
            <article className="event-detail-description">
              <h3>{DETAIL_TEXT.description}</h3>
              <p>{event.description || 'Este evento todavia no tiene una descripcion ampliada.'}</p>
            </article>

            <aside className="event-detail-summary" aria-label={DETAIL_TEXT.quickSummary}>
              <h3>{DETAIL_TEXT.quickSummary}</h3>
              <div className="event-detail-grid">
                <article className="event-detail-block">
                  <h4>{DETAIL_TEXT.when}</h4>
                  <p>{formatDate(event.event_date)}</p>
                </article>

                <article className="event-detail-block">
                  <h4>{DETAIL_TEXT.where}</h4>
                  <p>{event.location || DETAIL_TEXT.locationFallback}</p>
                </article>

                <article className="event-detail-block">
                  <h4>{DETAIL_TEXT.forWho}</h4>
                  <p>{formatAgeRange(event)}</p>
                </article>

                <article className="event-detail-block">
                  <h4>{DETAIL_TEXT.organizer}</h4>
                  <p>{event.organizer || DETAIL_TEXT.organizerFallback}</p>
                </article>
              </div>
            </aside>
          </div>

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
