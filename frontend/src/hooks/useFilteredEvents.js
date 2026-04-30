import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  buildSearchParamsFromFilters,
  filterEvents,
  filtersFromSearchParams,
  initialEventFilters
} from '../utils/eventFilters';
import { sortAudiencesByAge } from '../utils/audiences';
import { withAuthHeaders } from '../utils/authFetch';

function normalizeOptions(optionsOrMessage) {
  if (typeof optionsOrMessage === 'string') {
    return {
      eventLoadErrorMessage: optionsOrMessage,
      timeScope: 'upcoming',
      includeAuth: false
    };
  }

  return {
    eventLoadErrorMessage: optionsOrMessage?.eventLoadErrorMessage || 'No se pudieron cargar los eventos',
    timeScope: optionsOrMessage?.timeScope || 'upcoming',
    includeAuth: Boolean(optionsOrMessage?.includeAuth)
  };
}

function useFilteredEvents(optionsOrMessage = {}) {
  const { eventLoadErrorMessage, timeScope, includeAuth } = normalizeOptions(optionsOrMessage);
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

  const loadEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (timeScope && timeScope !== 'upcoming') {
        params.set('timeScope', timeScope);
      }

      const response = await fetch(`${API_BASE_URL}/events${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: includeAuth ? withAuthHeaders() : undefined
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.error || eventLoadErrorMessage);
      }
      setEvents(data);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setEvents([]);
      setLoadError(error.message || eventLoadErrorMessage);
    }
  }, [eventLoadErrorMessage, includeAuth, timeScope]);

  const loadCatalogs = useCallback(async () => {
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

      if (!categoriesRes.ok || !Array.isArray(categoriesData)) throw new Error('No se pudieron cargar las categorías');
      if (!audiencesRes.ok || !Array.isArray(audiencesData)) throw new Error('No se pudieron cargar las audiencias');
      if (!locationsRes.ok || !Array.isArray(locationsData)) throw new Error('No se pudieron cargar las ubicaciones');
      if (!organizersRes.ok || !Array.isArray(organizersData)) throw new Error('No se pudieron cargar los organizadores');

      setCategories(categoriesData);
      setAudiences(sortAudiencesByAge(audiencesData));
      setLocations(locationsData);
      setOrganizers(organizersData);
    } catch (error) {
      console.error(error);
      setLoadError(error.message || 'No se pudieron cargar los catálogos auxiliares');
    }
  }, []);

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

  const handleFilterChange = (event) => {
    const { name, type, value, checked } = event.target;
    applyFilterPatch({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const filteredEvents = useMemo(() => filterEvents(events, filters), [events, filters]);

  useEffect(() => {
    loadEvents();
    loadCatalogs();
  }, [loadEvents, loadCatalogs]);

  return {
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
    refreshEvents: loadEvents
  };
}

export default useFilteredEvents;
