const initialEventFilters = {
  category: '',
  audienceId: '',
  location: '',
  organizerId: '',
  freeOnly: false,
  compatibleAge: ''
};

const noFilteredEventsMessage = 'No hay eventos que cumplan los filtros seleccionados.';

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

export { filterEvents };
export { initialEventFilters };
export { noFilteredEventsMessage };
