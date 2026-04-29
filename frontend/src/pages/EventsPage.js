/**
 * Este archivo define la pagina de gestion de eventos.
 * Usa la logica compartida de filtrado y muestra el acceso a creacion,
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
  } = useFilteredEvents();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const isAuthenticated = Boolean(session?.token);
  const canUseFavorites = ['user', 'admin'].includes(session?.user?.role);
  const canManageEvents = ['admin', 'content_manager'].includes(session?.user?.role);

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
      <h2>Gestion de eventos</h2>

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

      <div style={{ marginBottom: '1rem' }}>
        {canManageEvents && (
          <Link to="/events/new">
            <button className="event-btn event-btn-primary">
              Crear nuevo evento
            </button>
          </Link>
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
