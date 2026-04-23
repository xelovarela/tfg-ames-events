/**
 * Este archivo agrupa la logica reutilizable de filtrado de eventos.
 * Aqui se define el estado inicial de los filtros, las funciones que interpretan
 * parametros de URL y el algoritmo que decide que eventos se muestran.
 */
// Estado base usado al inicializar o limpiar el formulario de filtros.
const initialEventFilters = {
  search: '',
  datePreset: '',
  category: '',
  audienceId: '',
  locality: '',
  organizerId: '',
  freeOnly: false,
  compatibleAge: ''
};

// Mensaje comun mostrado cuando ningun evento supera el filtrado.
const noFilteredEventsMessage = 'No hay eventos que cumplan los filtros seleccionados.';

// Convierte cadenas o valores vacios a numeros opcionales para comparar filtros.
function toOptionalNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

// Comprueba si una edad concreta encaja dentro del rango permitido por un evento.
function isAgeCompatible(event, ageFilter) {
  const age = toOptionalNumber(ageFilter);
  if (age === null) {
    return true;
  }

  const minAge = toOptionalNumber(event.min_age);
  const maxAge = toOptionalNumber(event.max_age);

  if (minAge === null || maxAge === null) {
    return true;
  }

  return age >= minAge && age <= maxAge;
}

// Comprueba si un evento encaja en el preset temporal seleccionado.
function isDatePresetMatch(eventDateValue, datePreset) {
  if (!datePreset) {
    return true;
  }

  const eventDate = new Date(eventDateValue);
  if (Number.isNaN(eventDate.getTime())) {
    return false;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()));

  if (datePreset === 'today') {
    return eventDate >= todayStart && eventDate < tomorrowStart;
  }

  if (datePreset === 'tomorrow') {
    const dayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
    return eventDate >= tomorrowStart && eventDate < dayAfterTomorrow;
  }

  if (datePreset === 'weekend') {
    const day = eventDate.getDay();
    return (day === 0 || day === 6) && eventDate >= todayStart && eventDate < weekEnd;
  }

  if (datePreset === 'week') {
    return eventDate >= todayStart && eventDate < weekEnd;
  }

  if (datePreset === 'month') {
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }

  return true;
}

// Aplica todos los criterios activos y devuelve solo los eventos compatibles.
function filterEvents(events, filters) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.filter((event) => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    if (normalizedSearch) {
      const searchableFields = [
        event.title,
        event.description,
        event.category,
        event.location,
        event.location_locality,
        event.audience,
        event.organizer
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchableFields.includes(normalizedSearch)) {
        return false;
      }
    }

    if (filters.category && event.category !== filters.category) {
      return false;
    }

    if (filters.audienceId && Number(event.audience_id) !== Number(filters.audienceId)) {
      return false;
    }

    if (filters.locality && event.location_locality !== filters.locality) {
      return false;
    }

    if (filters.organizerId && Number(event.organizer_id) !== Number(filters.organizerId)) {
      return false;
    }

    if (filters.freeOnly && Number(event.is_free) !== 1) {
      return false;
    }

    if (!isAgeCompatible(event, filters.compatibleAge)) {
      return false;
    }

    if (!isDatePresetMatch(event.event_date, filters.datePreset)) {
      return false;
    }

    return true;
  });
}

// Convierte la query string de la URL en un objeto de filtros utilizable por React.
function filtersFromSearchParams(searchParams) {
  const localityFromUrl = searchParams.get('locality') || searchParams.get('location') || '';

  return {
    search: searchParams.get('search') || '',
    datePreset: searchParams.get('datePreset') || '',
    category: searchParams.get('category') || '',
    audienceId: searchParams.get('audienceId') || '',
    locality: localityFromUrl,
    organizerId: searchParams.get('organizerId') || '',
    freeOnly: searchParams.get('freeOnly') === 'true',
    compatibleAge: searchParams.get('compatibleAge') || ''
  };
}

// Genera una URL compartible a partir del estado actual de los filtros.
function buildSearchParamsFromFilters(filters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.datePreset) {
    params.set('datePreset', filters.datePreset);
  }

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.audienceId) {
    params.set('audienceId', filters.audienceId);
  }

  if (filters.locality) {
    params.set('locality', filters.locality);
  }

  if (filters.organizerId) {
    params.set('organizerId', filters.organizerId);
  }

  if (filters.freeOnly) {
    params.set('freeOnly', 'true');
  }

  if (filters.compatibleAge) {
    params.set('compatibleAge', filters.compatibleAge);
  }

  return params;
}

// Se exportan todas las utilidades necesarias para lista y mapa.
export {
  filterEvents,
  initialEventFilters,
  noFilteredEventsMessage,
  filtersFromSearchParams,
  buildSearchParamsFromFilters
};
