/**
 * Este archivo define la portada principal de la aplicacion.
 * Sirve como punto de entrada para ir a agenda, mapa y eventos próximos
 * reutilizando el modelo de datos existente sin logica de backend adicional.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getEventImageUrl } from '../utils/eventImages';
import './HomePage.css';

function formatEventDateParts(value) {
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

function formatAudience(event) {
  const rawAudience = event?.audience_name ?? event?.audienceName ?? event?.audience;

  if (!rawAudience) {
    return '';
  }

  if (Array.isArray(rawAudience)) {
    return rawAudience.filter(Boolean).join(', ').trim();
  }

  if (typeof rawAudience === 'object') {
    return (rawAudience.name || rawAudience.label || '').trim();
  }

  return String(rawAudience).trim();
}

function HomePage({ session }) {
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const canCreateEventsDirectly = ['admin', 'content_manager'].includes(session?.user?.role);
  const isAuthenticated = Boolean(session?.token);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch(`${API_BASE_URL}/events`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error(data?.error || 'No se pudieron cargar los eventos');
        }

        if (isMounted) {
          setEvents(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setEvents([]);
          setLoadError(error.message || 'No se pudieron cargar los eventos');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();

    return [...events]
      .filter((event) => {
        const date = new Date(event.event_date);
        return !Number.isNaN(date.getTime()) && date >= now;
      })
      .sort((left, right) => new Date(left.event_date).getTime() - new Date(right.event_date).getTime())
      .slice(0, 6);
  }, [events]);

  const nextEvent = upcomingEvents[0];

  const renderEventCard = (event, { featured = false } = {}) => {
    const audienceLabel = formatAudience(event);
    const eventDateParts = formatEventDateParts(event.event_date);

    return (
      <article key={event.id} className={`home-event-card${featured ? ' home-event-card-featured' : ''}`}>
        <Link to={`/events/${event.id}`} className="home-event-image-link" aria-label={`Ver ${event.title}`}>
          <img src={getEventImageUrl(event)} alt="" className="home-event-image" loading="lazy" />
          <div className="home-event-date-overlay" aria-label={`Fecha: ${new Date(event.event_date).toLocaleString('es-ES')}`}>
            <strong>{eventDateParts.day}</strong>
            <span>{eventDateParts.month}</span>
            {eventDateParts.time && <small>{eventDateParts.time}</small>}
          </div>
          <div className="home-event-chips" aria-hidden="true">
            <span className="home-event-chip">{event.category || 'Sin categoria'}</span>
            {Number(event.is_free) === 1 && <span className="home-event-chip home-event-chip-soft">Gratis</span>}
            {audienceLabel && <span className="home-event-chip home-event-chip-audience">{audienceLabel}</span>}
          </div>
        </Link>

        <div className="home-event-body">
          <h3>
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h3>

          <p className="home-event-meta">
            <span className="home-event-meta-icon" aria-hidden="true"><MapPin /></span>
            <span className="home-event-meta-text">{event.location || 'Ubicacion por confirmar'}</span>
          </p>
        </div>
      </article>
    );
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-label="Acceso principal">
        <div className="home-hero-copy">
          <p className="home-kicker">Benvida a Ames</p>
          <h1>La agenda local para encontrar el próximo plan</h1>
          <p className="home-subtitle">
            Explora actividades municipales, familiares y culturales desde una agenda clara
            o sobre el mapa del concello.
          </p>

          <div className="home-hero-actions">
            <Link to="/events" className="home-cta home-cta-primary">
              Ver agenda
              <span aria-hidden="true"><ArrowRight /></span>
            </Link>
            <Link to="/map" className="home-cta home-cta-secondary">
              Abrir mapa
              <span aria-hidden="true"><MapPin /></span>
            </Link>
          </div>
        </div>

        <div className="home-hero-panel" aria-label="Siguiente evento destacado">
          <p className="home-kicker">Siguiente plan</p>
          {isLoading && <p className="home-hero-panel-text">Cargando agenda...</p>}
          {!isLoading && loadError && <p className="home-hero-panel-text">{loadError}</p>}
          {!isLoading && !loadError && !nextEvent && (
            <p className="home-hero-panel-text">Todavia no hay eventos futuros publicados.</p>
          )}
          {!isLoading && !loadError && nextEvent && (
            <div className="home-hero-panel-card">
              {renderEventCard(nextEvent, { featured: true })}
            </div>
          )}
        </div>
      </section>

      <section className="home-upcoming" aria-label="Eventos próximos">
        <div className="home-section-head">
          <div>
            <p className="home-kicker">Proximamente</p>
            <h2>Eventos próximos</h2>
          </div>
          <Link to="/events" className="home-inline-link">Ver toda la agenda</Link>
        </div>

        {isLoading && <p className="home-feedback">Cargando eventos próximos...</p>}
        {!isLoading && loadError && <p className="home-feedback home-feedback-error">{loadError}</p>}
        {!isLoading && !loadError && upcomingEvents.length === 0 && (
          <p className="home-feedback">Todavia no hay eventos futuros publicados.</p>
        )}

        {!isLoading && !loadError && upcomingEvents.length > 0 && (
          <div className="home-upcoming-grid">
            {upcomingEvents.map((event) => renderEventCard(event))}
          </div>
        )}
      </section>

      <section className="home-proposal-cta" aria-label="Solicitar acceso como creador de contenido">
        <span className="home-proposal-icon" aria-hidden="true"><Megaphone /></span>
        <div>
          <p className="home-kicker">Quieres publicar eventos</p>
          <h2>Solicita acceso como creador de contenido</h2>
          <p>
            Si formas parte de una entidad o gestionas actividades, puedes pedir permisos para publicar en la plataforma.
          </p>
        </div>
        <Link
          to={canCreateEventsDirectly ? '/events/new' : isAuthenticated ? '/propose-event' : '/login'}
          state={!canCreateEventsDirectly && !isAuthenticated ? { from: { pathname: '/propose-event' } } : undefined}
          className="home-cta home-cta-light"
        >
          {canCreateEventsDirectly ? 'Crear evento' : 'Solicitar acceso'}
          <span aria-hidden="true"><ArrowRight /></span>
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
