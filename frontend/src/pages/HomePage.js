/**
 * Este archivo define la portada principal de la aplicacion.
 * Sirve como punto de entrada para ir a agenda, mapa y eventos proximos
 * reutilizando el modelo de datos existente sin logica de backend adicional.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Heart, MapPin, Megaphone, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getEventImageUrl } from '../utils/eventImages';
import './HomePage.css';

function formatEventDate(value) {
  if (!value) {
    return 'Fecha por confirmar';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Fecha por confirmar';
  }

  return date.toLocaleString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function HomePage({ session }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [events, setEvents] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const canAccessFavorites = ['user', 'admin'].includes(session?.user?.role);
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

  const handleSearchSubmit = (submitEvent) => {
    submitEvent.preventDefault();

    const params = new URLSearchParams();
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }

    const query = params.toString();
    navigate(query ? `/events?${query}` : '/events');
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-label="Acceso principal">
        <p className="home-kicker">Benvida a Ames</p>
        <h1>Encuentra planes municipales y familiares en segundos</h1>
        <p className="home-subtitle">
          Consulta agenda y mapa con filtros compartidos para descubrir actividades cercanas,
          por fecha, publico, barrio y precio.
        </p>

        <form className="home-search" onSubmit={handleSearchSubmit}>
          <label htmlFor="home-search-input">Buscar eventos o lugares</label>
          <div className="home-search-row">
            <span className="home-search-icon" aria-hidden="true"><Search /></span>
            <input
              id="home-search-input"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Ejemplo: teatro, Bertamirans, infantil..."
            />
            <button type="submit">Buscar en agenda</button>
          </div>
        </form>

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
      </section>

      <section className="home-quick-links" aria-label="Accesos rapidos">
        <h2>Accesos rapidos</h2>
        <div className="home-quick-grid">
          <Link to="/events" className="home-quick-card">
            <span className="home-quick-icon" aria-hidden="true"><CalendarDays /></span>
            <strong>Agenda</strong>
            <p>Lista completa con filtros avanzados.</p>
          </Link>

          <Link to="/map" className="home-quick-card">
            <span className="home-quick-icon" aria-hidden="true"><MapPin /></span>
            <strong>Mapa</strong>
            <p>Explora eventos por ubicacion y zona.</p>
          </Link>

          {canAccessFavorites ? (
            <Link to="/favorites" className="home-quick-card">
              <span className="home-quick-icon" aria-hidden="true"><Heart /></span>
              <strong>Mis eventos guardados</strong>
              <p>Revisa tus favoritos y vuelve rapido.</p>
            </Link>
          ) : (
            <Link to="/login" className="home-quick-card">
              <span className="home-quick-icon" aria-hidden="true"><Heart /></span>
              <strong>Entrar para guardar</strong>
              <p>Inicia sesion para usar favoritos y alertas.</p>
            </Link>
          )}
        </div>
      </section>

      <section className="home-proposal-cta" aria-label="Solicitar acceso como creador de contenido">
        <span className="home-proposal-icon" aria-hidden="true"><Megaphone /></span>
        <div>
          <p className="home-kicker">¿Quieres publicar eventos?</p>
          <h2>Solicita acceso como creador de contenido</h2>
          <p>
            Si eres usuario registrado, puedes solicitar permisos para crear y publicar eventos en la plataforma.
          </p>
        </div>
        <Link
          to={canCreateEventsDirectly ? '/events/new' : isAuthenticated ? '/propose-event' : '/login'}
          state={!canCreateEventsDirectly && !isAuthenticated ? { from: { pathname: '/propose-event' } } : undefined}
          className="home-cta home-cta-primary"
        >
          Solicitar acceso
          <span aria-hidden="true"><ArrowRight /></span>
        </Link>
      </section>

      <section className="home-upcoming" aria-label="Eventos proximos">
        <div className="home-section-head">
          <div>
            <p className="home-kicker">Proximamente</p>
            <h2>Eventos proximos</h2>
          </div>
          <Link to="/events" className="home-inline-link">Ver toda la agenda</Link>
        </div>

        {isLoading && <p className="home-feedback">Cargando eventos proximos...</p>}
        {!isLoading && loadError && <p className="home-feedback home-feedback-error">{loadError}</p>}
        {!isLoading && !loadError && upcomingEvents.length === 0 && (
          <p className="home-feedback">Todavia no hay eventos futuros publicados.</p>
        )}

        {!isLoading && !loadError && upcomingEvents.length > 0 && (
          <div className="home-upcoming-grid">
            {upcomingEvents.map((event) => (
              <article key={event.id} className="home-event-card">
                <Link to={`/events/${event.id}`} className="home-event-image-link" aria-label={`Ver ${event.title}`}>
                  <img src={getEventImageUrl(event)} alt="" className="home-event-image" loading="lazy" />
                </Link>

                <div className="home-event-body">
                  <div className="home-event-chips">
                    <span className="home-event-chip">{event.category || 'Sin categoria'}</span>
                    {Number(event.is_free) === 1 && <span className="home-event-chip home-event-chip-soft">Gratis</span>}
                  </div>

                  <h3>
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                  </h3>

                  <p className="home-event-meta">
                    <span className="home-event-meta-icon" aria-hidden="true"><CalendarDays /></span>
                    {formatEventDate(event.event_date)}
                  </p>
                  <p className="home-event-meta">
                    <span className="home-event-meta-icon" aria-hidden="true"><MapPin /></span>
                    {event.location || 'Ubicacion por confirmar'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="home-how" aria-label="Como funciona">
        <h2>Como aprovechar la app</h2>
        <div className="home-how-grid">
          <article className="home-how-card">
            <span className="home-how-icon" aria-hidden="true"><MapPin /></span>
            <h3>Descubre</h3>
            <p>Empieza por mapa o agenda segun prefieras una vista geografica o por listado.</p>
          </article>
          <article className="home-how-card">
            <span className="home-how-icon" aria-hidden="true"><SlidersHorizontal /></span>
            <h3>Filtra</h3>
            <p>Usa fecha, ubicacion, publico y categoria. Los filtros son compartidos entre mapa y agenda.</p>
          </article>
          <article className="home-how-card">
            <span className="home-how-icon" aria-hidden="true"><Heart /></span>
            <h3>Guarda</h3>
            <p>Marca favoritos para recuperar planes rapidamente y recibir recordatorios.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
