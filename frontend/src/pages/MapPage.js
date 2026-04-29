/**
 * Este archivo define la página del mapa.
 * Reutiliza la carga y filtrado de eventos y renderiza el mapa interactivo
 * mostrando solo los eventos que cumplen esos filtros.
 */
import React from 'react';
import AmesMap from '../AmesMap';
import EventFilters from '../EventFilters';
import useFilteredEvents from '../hooks/useFilteredEvents';
import { noFilteredEventsMessage } from '../utils/eventFilters';

function MapPage() {
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
  } = useFilteredEvents('No se pudieron cargar los eventos para el mapa');

  return (
    <main>
      <h2>Mapa de eventos</h2>

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

      <AmesMap events={filteredEvents} />

      {filteredEvents.length === 0 && !loadError && (
        <p className="event-filters-feedback event-filters-feedback-empty">{noFilteredEventsMessage}</p>
      )}
    </main>
  );
}

export default MapPage;
