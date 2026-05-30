/**
 * Pagina de calendario de eventos.
 * Combina filtros reutilizables con la vista mensual para explorar la agenda.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EventCalendar from '../EventCalendar';
import EventFilters from '../EventFilters';
import useFilteredEvents from '../hooks/useFilteredEvents';
import { noFilteredEventsMessage } from '../utils/eventFilters';

function EventCalendarPage({ session }) {
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
    applyFilterPatch
  } = useFilteredEvents({
    eventLoadErrorMessage: 'No se pudieron cargar los eventos para el calendario',
    timeScope: canManageEvents ? timeScope : 'upcoming',
    includeAuth: canManageEvents
  });

  useEffect(() => {
    if (!canManageEvents && timeScope !== 'upcoming') {
      setTimeScope('upcoming');
    }
  }, [canManageEvents, timeScope]);

  return (
    <main>
      <h2>Calendario de eventos</h2>

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
        {canManageEvents && (
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
        )}

        <Link to="/events" className="app-inline-link">
          Ver listado
        </Link>
      </div>

      <EventCalendar events={filteredEvents} emptyMessage={noFilteredEventsMessage} />
    </main>
  );
}

export default EventCalendarPage;
