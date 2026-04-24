/**
 * Este archivo define la pagina de gestion de eventos.
 * Carga el listado completo, aplica filtros sincronizados con la URL y muestra
 * el acceso a creacion y el listado reutilizable de eventos.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import EventList from '../EventList';
import EventFilters from '../EventFilters';
import { API_BASE_URL } from '../config';
import { addFavorite, listFavoriteIds, removeFavorite } from '../utils/favoritesApi';
import {
  filterEvents,
  initialEventFilters,
  noFilteredEventsMessage,
  filtersFromSearchParams,
  buildSearchParamsFromFilters
} from '../utils/eventFilters';

// Este componente coordina la vista de gestion y filtrado del catalogo de eventos.
function EventsPage({ session }) {
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
  const [favoriteIds, setFavoriteIds] = useState([]);
  const isAuthenticated = Boolean(session?.token);
  const canUseFavorites = ['user', 'admin'].includes(session?.user?.role);
  const canManageEvents = ['admin', 'content_manager'].includes(session?.user?.role);

  // La URL actua como fuente de verdad compartible para el estado de filtros.
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

  // Carga todos los eventos disponibles desde la API.
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

  // Carga los catalogos auxiliares usados por los selects de filtrado.
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

  // Se reutiliza al borrar eventos para refrescar el listado visible.
  const refreshAll = () => {
    loadEvents();
  };

  // Cada cambio del formulario se refleja en estado y en la URL.
  const handleFilterChange = (event) => {
    const { name, type, value, checked } = event.target;
    const patch = {
      [name]: type === 'checkbox' ? checked : value
    };
    applyFilterPatch(patch);
  };

  // Permite actualizaciones atomicas de varios chips en un solo paso.
  const applyFilterPatch = (patch) => {
    setFilters((currentFilters) => {
      const nextFilters = {
        ...currentFilters,
        ...patch
      };
      setSearchParams(buildSearchParamsFromFilters(nextFilters));
      return nextFilters;
    });
  };

  // El listado final se calcula solo cuando cambian los eventos o los filtros.
  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);

  useEffect(() => {
    loadEvents();
    loadCatalogs();
  }, []);

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

      {/* Mismo panel de filtros que en el mapa para mantener una experiencia coherente. */}
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

      {/* Accion principal para acceder al formulario de alta de eventos. */}
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
        onEventDeleted={refreshAll}
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
