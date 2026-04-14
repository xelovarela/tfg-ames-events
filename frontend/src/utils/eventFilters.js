/**
 * Este archivo agrupa la logica reutilizable de filtrado de eventos.
 * Aqui se define el estado inicial de los filtros, las funciones que interpretan
 * parametros de URL y el algoritmo que decide que eventos se muestran.
 */
// Estado base usado al inicializar o limpiar el formulario de filtros.
const initialEventFilters = {
  category: '',
  audienceId: '',
  location: '',
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

// Aplica todos los criterios activos y devuelve solo los eventos compatibles.
function filterEvents(events, filters) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.filter((event) => {
    if (filters.category && event.category !== filters.category) {
      return false;
    }

    if (filters.audienceId && Number(event.audience_id) !== Number(filters.audienceId)) {
      return false;
    }

    if (filters.location && event.location !== filters.location) {
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

    return true;
  });
}

// Convierte la query string de la URL en un objeto de filtros utilizable por React.
function filtersFromSearchParams(searchParams) {
  return {
    category: searchParams.get('category') || '',
    audienceId: searchParams.get('audienceId') || '',
    location: searchParams.get('location') || '',
    organizerId: searchParams.get('organizerId') || '',
    freeOnly: searchParams.get('freeOnly') === 'true',
    compatibleAge: searchParams.get('compatibleAge') || ''
  };
}

// Genera una URL compartible a partir del estado actual de los filtros.
function buildSearchParamsFromFilters(filters) {
  const params = new URLSearchParams();

  if (filters.category) {
    params.set('category', filters.category);
  }

  if (filters.audienceId) {
    params.set('audienceId', filters.audienceId);
  }

  if (filters.location) {
    params.set('location', filters.location);
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