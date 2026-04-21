/**
 * Este archivo define la pagina del mapa.
 * Carga eventos y catalogos auxiliares, sincroniza los filtros con la URL y
 * renderiza el mapa interactivo mostrando solo los eventos que cumplen esos filtros.
 */
import AmesMap from '../AmesMap';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventFilters from '../EventFilters';
import { API_BASE_URL } from '../config';
import {
  filterEvents,
  initialEventFilters,
  noFilteredEventsMessage,
  filtersFromSearchParams,
  buildSearchParamsFromFilters
} from '../utils/eventFilters';

// Este componente coordina la carga de datos y el estado de filtrado del mapa.
function MapPage() {
  const [events, setEvents] = useState([]);
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

  // Si la URL cambia por navegacion o por compartir enlaces, el estado local se actualiza.
  useEffect(() => {
    const nextFilters = {
      ...initialEventFilters,
      ...filtersFromSearchParams(searchParams)
    };

    setFilters((currentFilters) => {
      const isDifferent = JSON.stringify(nextFilters) !== JSON.stringify(currentFilters);
      return isDifferent ? nextFilters : currentFilters;
    });
  }, [searchParams]);

  // Carga el listado de eventos que despues se filtrara en memoria.
  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.error || 'No se pudieron cargar los eventos para el mapa');
      }
      setEvents(data);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setEvents([]);
      setLoadError(error.message || 'No se pudieron cargar los eventos para el mapa');
    }
  };

  // Carga categorias, audiencias, ubicaciones y organizadores para poblar los filtros.
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

  // Cada cambio en los filtros actualiza tanto el estado como la query string.
  const handleFilterChange = (event) => {
    const { name, type, value, checked } = event.target;

    const nextFilters = {
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    };

    setFilters(nextFilters);
    setSearchParams(buildSearchParamsFromFilters(nextFilters));
  };

  // Este manejador restablece los filtros a su estado inicial.
  const handleClearFilters = () => {
    setFilters({ ...initialEventFilters });
    setSearchParams({});
  };

  // Se memoriza el resultado del filtrado para evitar calculos innecesarios en cada render.
  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);

  // La primera vez que se monta la pagina se cargan eventos y catalogos auxiliares.
  useEffect(() => {
    loadEvents();
    loadCatalogs();
  }, []);

  return (
    <main>
      <h2>Mapa de eventos</h2>

      {/* Panel de filtros reutilizable compartido con la pagina de listado. */}
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

      {/* El mapa recibe solo los eventos ya filtrados para simplificar la vista. */}
      <AmesMap events={filteredEvents} />

      {filteredEvents.length === 0 && !loadError && (
        <p className="event-filters-feedback event-filters-feedback-empty">{noFilteredEventsMessage}</p>
      )}
    </main>
  );
}

export default MapPage;
