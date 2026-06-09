/**
 * Este archivo define la página de gestión de eventos.
 * Usa la logica compartida de filtrado y muestra el acceso a creación,
 * favoritos y listado reutilizable de eventos.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventList from '../EventList';
import EventFilters from '../EventFilters';
import useFilteredEvents from '../hooks/useFilteredEvents';
import { addFavorite, listFavoriteIds, removeFavorite } from '../utils/favoritesApi';
import { noFilteredEventsMessage } from '../utils/eventFilters';

function EventsPage({ session }) {
  const [timeScope, setTimeScope] = useState('upcoming');
  const canManageEvents = ['admin', 'content_manager'].includes(session?.user?.role);
  const {
    events,
    categories,
    audiences,
    locations,
    organizers,
    filters,
    filteredEvents,
    loadError,
    handleFilterChange,
    applyFilterPatch,
    refreshEvents
  } = useFilteredEvents({
    timeScope: canManageEvents ? timeScope : 'upcoming',
    includeAuth: canManageEvents
  });
  const [favoriteIds, setFavoriteIds] = useState([]);
  const isAuthenticated = Boolean(session?.token);
  const canUseFavorites = isAuthenticated;

  useEffect(() => {
    if (!canManageEvents && timeScope !== 'upcoming') {
      setTimeScope('upcoming');
    }
  }, [canManageEvents, timeScope]);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteIdsForUser = async () => {
      if (!isAuthenticated || !canUseFavorites) {
        if (isMounted) {
          setFavoriteIds([]);
        }
        return;
      }

      try {
        const ids = await listFavoriteIds();
        if (isMounted) {
          setFavoriteIds(ids);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setFavoriteIds([]);
        }
      }
    };

    loadFavoriteIdsForUser();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, canUseFavorites]);

  const handleToggleFavorite = async (eventId, isFavorite) => {
    if (!isAuthenticated || !canUseFavorites) {
      return;
    }

    if (isFavorite) {
      await removeFavorite(eventId);
      setFavoriteIds((current) => current.filter((id) => Number(id) !== Number(eventId)));
      return;
    }

    await addFavorite(eventId);
    setFavoriteIds((current) => (current.includes(Number(eventId)) ? current : [...current, Number(eventId)]));
  };

  return (
    <main>
      <h2>Gestión de eventos</h2>

      <EventFilters
        filters={filters}
        categories={categories}
        audiences={audiences}
        locations={locations}
        organizers={organizers}
        totalCount={events.length}
        filteredCount={filteredEvents.length}
        onChange={handleFilterChange}
        onPatch={applyFilterPatch}
      />

      {loadError && <p className="event-filters-feedback event-filters-feedback-error">{loadError}</p>}

      <div className="event-management-toolbar">
        <Link to="/events/calendar" className="app-inline-link">
          Ver calendario
        </Link>

        {canManageEvents && (
          <>
            <div className="event-time-scope-filter" aria-label="Filtro temporal de eventos">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'upcoming', label: 'Futuros' },
                { value: 'past', label: 'Pasados' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={timeScope === option.value ? 'active' : ''}
                  onClick={() => setTimeScope(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Link to="/events/new">
              <button className="event-btn event-btn-primary">
                Crear nuevo evento
              </button>
            </Link>
          </>
        )}
      </div>

      <EventList
        events={filteredEvents}
        onEventDeleted={refreshEvents}
        favoriteEventIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        showFavoriteButton={canUseFavorites}
        canManageEvents={canManageEvents}
        emptyMessage={noFilteredEventsMessage}
        showEmptyState={!loadError}
      />
    </main>
  );
}

export default EventsPage;
