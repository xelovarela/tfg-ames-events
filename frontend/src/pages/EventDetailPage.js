/**
 * Este archivo define la pagina de detalle de un evento.
 * Recupera un registro concreto desde la API, formatea sus datos para presentacion
 * y muestra una ficha legible con su informacion principal.
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { addFavorite, listFavoriteIds, removeFavorite } from '../utils/favoritesApi';

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

  return `${event.min_age}-${event.max_age} anios`;
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
    <main>
      <h2>Detalle del Evento</h2>

      {/* Navegacion secundaria para volver rapidamente a mapa o listado. */}
      <div className="event-detail-nav">
        <Link to="/map" className="app-inline-link">Volver al mapa</Link>
        <span>·</span>
        <Link to="/events" className="app-inline-link">Volver a eventos</Link>
      </div>

      {loading && <p>Cargando evento...</p>}

      {!loading && error && (
        <div className="event-detail-card">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && event && (
        <section className="event-detail-card">
          {/* Tarjeta principal que agrupa la informacion relevante del evento. */}
          <div className="event-detail-hero">
            <h3>{event.title}</h3>
            <div className="event-detail-tags">
              <span className="event-detail-tag">{event.category}</span>
              <span className="event-detail-tag">{event.audience || 'Audiencia general'}</span>
              <span className="event-detail-tag">{formatPrice(event)}</span>
            </div>
          </div>

          <div className="event-detail-grid">
            <article className="event-detail-block">
              <h4>Cuando</h4>
              <p>{formatDate(event.event_date)}</p>
            </article>

            <article className="event-detail-block">
              <h4>Donde</h4>
              <p>{event.location || 'Ubicacion no especificada'}</p>
            </article>

            <article className="event-detail-block">
              <h4>Para quien</h4>
              <p>{formatAgeRange(event)}</p>
            </article>

            <article className="event-detail-block">
              <h4>Organiza</h4>
              <p>{event.organizer || 'No especificado'}</p>
            </article>
          </div>

          {event.description && (
            <article className="event-detail-block">
              <h4>Descripcion</h4>
              <p>{event.description}</p>
            </article>
          )}

          {canUseFavorites && (
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="event-btn event-btn-primary"
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
              >
                {isFavoriteLoading
                  ? 'Actualizando...'
                  : isFavorite
                    ? 'Quitar de favoritos'
                    : 'Guardar en favoritos'}
              </button>
              {favoriteMessage && <p style={{ marginTop: '0.5rem' }}>{favoriteMessage}</p>}
            </div>
          )}

          <p className="event-detail-note">
            Informacion de ubicacion: latitud {event.lat}, longitud {event.lng}.
          </p>
        </section>
      )}
    </main>
  );
}

export default EventDetailPage;
