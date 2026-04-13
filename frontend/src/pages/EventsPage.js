import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventForm from '../EventForm';
import EventList from '../EventList';
import EventFilters from '../EventFilters';
import { API_BASE_URL } from '../config';
import {
  filterEvents,
  initialEventFilters,
  noFilteredEventsMessage,
  filtersFromSearchParams,
  buildSearchParamsFromFilters
} from '../utils/eventFilters';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [categories, setCategories] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [locations, setLocations] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({
    ...initialEventFilters,
    ...filtersFromSearchParams(searchParams)
  }));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
  const nextFilters = {
    ...initialEventFilters,
    ...filtersFromSearchParams(searchParams)
  };

  const isDifferent = JSON.stringify(nextFilters) !== JSON.stringify(filters);

  if (isDifferent) {
    setFilters(nextFilters);
  }
}, [searchParams]);

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.error || 'No se pudieron cargar los eventos');
      }
      setEvents(data);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setEvents([]);
      setLoadError(error.message || 'No se pudieron cargar los eventos');
    }
  };

  const loadCatalogs = async () => {
    try {
      const [categoriesRes, audiencesRes, locationsRes, organizersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/categories`),
        fetch(`${API_BASE_URL}/audiences`),
        fetch(`${API_BASE_URL}/locations`),
        fetch(`${API_BASE_URL}/organizers`)
      ]);

      const [categoriesData, audiencesData, locationsData, organizersData] = await Promise.all([
        categoriesRes.json(),
        audiencesRes.json(),
        locationsRes.json(),
        organizersRes.json()
      ]);

      if (!categoriesRes.ok || !Array.isArray(categoriesData)) throw new Error('No se pudieron cargar las categorias');
      if (!audiencesRes.ok || !Array.isArray(audiencesData)) throw new Error('No se pudieron cargar las audiencias');
      if (!locationsRes.ok || !Array.isArray(locationsData)) throw new Error('No se pudieron cargar las ubicaciones');
      if (!organizersRes.ok || !Array.isArray(organizersData)) throw new Error('No se pudieron cargar los organizadores');

      setCategories(categoriesData);
      setAudiences(audiencesData);
      setLocations(locationsData);
      setOrganizers(organizersData);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || 'No se pudieron cargar los catalogos auxiliares');
    }
  };

  const refreshAll = () => {
    loadEvents();
  };

  const handleEditEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading event');
      }

      setEventToEdit(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar el evento');
    }
  };

  const handleEditFinished = () => {
    setEventToEdit(null);
    refreshAll();
  };

  const handleFilterChange = (event) => {
    const { name, type, value, checked } = event.target;

    const nextFilters = {
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    };

    setFilters(nextFilters);
    setSearchParams(buildSearchParamsFromFilters(nextFilters));
  };

  const handleClearFilters = () => {
    setFilters({ ...initialEventFilters });
    setSearchParams({});
  };

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);

  useEffect(() => {
    loadEvents();
    loadCatalogs();
  }, []);

  return (
    <main>
      <h2>Gestion de Eventos</h2>

      <EventFilters
        filters={filters}
        categories={categories}
        audiences={audiences}
        locations={locations}
        organizers={organizers}
        totalCount={events.length}
        filteredCount={filteredEvents.length}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {loadError && <p className="event-filters-feedback event-filters-feedback-error">{loadError}</p>}

      <EventForm
        onEventCreated={refreshAll}
        eventToEdit={eventToEdit}
        onEditFinished={handleEditFinished}
      />

      <EventList
        events={filteredEvents}
        onEditEvent={handleEditEvent}
        onEventDeleted={refreshAll}
        emptyMessage={noFilteredEventsMessage}
        showEmptyState={!loadError}
      />
    </main>
  );
}

export default EventsPage;