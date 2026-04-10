import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

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

function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <main>
      <h2>Detalle del Evento</h2>

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

          <p className="event-detail-note">
            Informacion de ubicacion: latitud {event.lat}, longitud {event.lng}.
          </p>
        </section>
      )}
    </main>
  );
}

export default EventDetailPage;
