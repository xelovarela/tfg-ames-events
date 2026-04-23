/**
 * Este archivo implementa el panel reutilizable de filtros de eventos.
 * Recibe estado y callbacks desde sus paginas padre y renderiza una interfaz
 * de chips compartida por mapa y listado.
 */
import React from 'react';
import './EventFilters.css';

const DATE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Manana' },
  { value: 'weekend', label: 'Este finde' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' }
];

function getCategoryIcon(categoryName) {
  const normalized = String(categoryName || '').toLowerCase();

  if (normalized.includes('mus')) return <IconMusic />;
  if (normalized.includes('deport')) return <IconSport />;
  if (normalized.includes('cultur')) return <IconCulture />;
  if (normalized.includes('infant')) return <IconKids />;
  if (normalized.includes('educ')) return <IconEducation />;
  if (normalized.includes('mercad')) return <IconStore />;
  if (normalized.includes('teatr')) return <IconCulture />;

  return <IconDot />;
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M7 3.5v4M17 3.5v4M3.5 9.5h17" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 21s6-5.8 6-11a6 6 0 1 0-12 0c0 5.2 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9" cy="8.2" r="2.6" />
      <path d="M4.5 17.5a4.5 4.5 0 0 1 9 0" />
      <circle cx="16.8" cy="9.2" r="2.1" />
      <path d="M14 17.5a3.6 3.6 0 0 1 6.2-2.3" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12V5a1 1 0 0 1 1-1h7l8 8-8 8-8-8Z" />
      <circle cx="8.2" cy="8.2" r="1.2" />
    </svg>
  );
}

function IconDot() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 17V7l10-2v10" />
    </svg>
  );
}

function IconSport() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5a8.5 8.5 0 0 1 0 15M12 4.5a8.5 8.5 0 0 0 0 15M4.5 12h15" />
    </svg>
  );
}

function IconCulture() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 4.5 14 10l6 .5-4.5 3.7 1.4 5.8L12 16.8 7.1 20l1.4-5.8L4 10.5 10 10Z" />
    </svg>
  );
}

function IconEducation() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.5 9.5 12 5l8.5 4.5L12 14 3.5 9.5ZM6.5 11.2v4.8L12 19l5.5-3v-4.8" />
    </svg>
  );
}

function IconKids() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="2.3" />
      <circle cx="15" cy="9" r="2.3" />
      <path d="M5.3 17a3.7 3.7 0 0 1 7.4 0M11.3 17a3.7 3.7 0 0 1 7.4 0" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9.5 5.5 5h13L20 9.5M5 9.5h14V19H5zM9 19v-5h6v5" />
    </svg>
  );
}

function EventFilters({
  filters = {
    datePreset: '',
    category: '',
    audienceId: '',
    locality: '',
    organizerId: '',
    freeOnly: false,
    compatibleAge: ''
  },
  categories = [],
  audiences = [],
  locations = [],
  organizers = [],
  totalCount,
  filteredCount,
  onChange = () => {},
  onPatch = null
}) {
  const localityOptions = [
    ...new Set(
      locations
        .map((location) => location.locality)
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, 'es'));

  const categoryOptions = [
    { value: '', label: 'Todos' },
    ...categories.map((category) => ({ value: category.name, label: category.name }))
  ];

  const safeDateSelection = DATE_OPTIONS.some((option) => option.value === filters.datePreset) ? filters.datePreset : '';
  const safeCategorySelection = categoryOptions.some((option) => option.value === filters.category) ? filters.category : '';
  const safeAudienceSelection = audiences.some((audience) => String(audience.id) === String(filters.audienceId))
    ? String(filters.audienceId)
    : '';
  const safeLocalitySelection = localityOptions.includes(filters.locality) ? filters.locality : '';

  const hasAnyChipFilter = Boolean(
    filters.datePreset || filters.category || filters.audienceId || filters.locality || filters.freeOnly
  );

  const emitChange = ({ name, value, type = 'text', checked = false }) => {
    onChange({
      target: { name, value, type, checked }
    });
  };

  const emitPatch = (patch) => {
    if (typeof onPatch === 'function') {
      onPatch(patch);
      return;
    }

    Object.entries(patch).forEach(([name, value]) => {
      if (typeof value === 'boolean') {
        emitChange({ name, value: '', type: 'checkbox', checked: value });
      } else {
        emitChange({ name, value });
      }
    });
  };

  const handleDateSelect = (value) => {
    emitChange({ name: 'datePreset', value });
  };

  const handleCategorySelect = (value) => {
    emitPatch({
      category: value,
      freeOnly: false
    });
  };

  const handleAudienceSelect = (value) => {
    emitChange({ name: 'audienceId', value });
  };

  const handleLocalitySelect = (value) => {
    emitChange({ name: 'locality', value });
  };

  const handleAllSelect = () => {
    emitPatch({
      datePreset: '',
      category: '',
      audienceId: '',
      locality: '',
      freeOnly: false
    });
  };

  const handleFreeSelect = () => {
    emitPatch({
      freeOnly: !filters.freeOnly,
      category: filters.freeOnly ? filters.category : ''
    });
  };

  const renderChipSection = ({ label, icon, options, selectedValue, onSelect }) => (
    <section className="event-filter-section" aria-label={label}>
      <div className="event-filter-section-head">
        <span className="event-filter-section-icon" aria-hidden="true">{icon}</span>
        <span className="event-filter-chip-label">{label}</span>
      </div>
      <div className="event-filter-chip-group" role="group" aria-label={`${label} options`}>
        {options.map((option) => {
          const isActive = selectedValue === option.value;
          return (
            <button
              key={option.value || '__all__'}
              type="button"
              className={`event-filter-chip${isActive ? ' is-active' : ''}`}
              onClick={() => onSelect(option.value)}
              aria-pressed={isActive}
            >
              {option.icon && <span className="event-filter-chip-icon" aria-hidden="true">{option.icon}</span>}
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );

  void organizers;

  return (
    <section className="event-filters-card">
      <div className="event-filters-topline">
        <div className="event-filters-chip-toolbar">
          <button
            type="button"
            className={`event-filter-chip event-filter-chip-main${!hasAnyChipFilter ? ' is-active' : ''}`}
            onClick={handleAllSelect}
            aria-pressed={!hasAnyChipFilter}
          >
            <span className="event-filter-chip-icon" aria-hidden="true"><IconGrid /></span>
            Todos
          </button>

          <button
            type="button"
            className={`event-filter-chip${filters.freeOnly ? ' is-active' : ''}`}
            onClick={handleFreeSelect}
            aria-pressed={filters.freeOnly}
          >
            <span className="event-filter-chip-icon" aria-hidden="true"><IconTag /></span>
            Gratis
          </button>

          {categories.map((category) => {
            const isActive = safeCategorySelection === category.name;
            return (
              <button
                key={category.id}
                type="button"
                className={`event-filter-chip${isActive ? ' is-active' : ''}`}
                onClick={() => handleCategorySelect(category.name)}
                aria-pressed={isActive}
              >
                <span className="event-filter-chip-icon" aria-hidden="true">{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="event-filters-header">
          <h3>Filtros de eventos</h3>
          <p>Mostrando {filteredCount} de {totalCount} eventos</p>
        </div>
      </div>

      <div className="event-filters-sections">
        {renderChipSection({
          label: 'Fecha',
          icon: <IconCalendar />,
          options: DATE_OPTIONS,
          selectedValue: safeDateSelection,
          onSelect: handleDateSelect
        })}

        {renderChipSection({
          label: 'Ubicacion',
          icon: <IconLocation />,
          options: [
            { value: '', label: 'Todos' },
            ...localityOptions.map((locality) => ({ value: locality, label: locality }))
          ],
          selectedValue: safeLocalitySelection,
          onSelect: handleLocalitySelect
        })}

        {renderChipSection({
          label: 'Publico',
          icon: <IconUsers />,
          options: [
            { value: '', label: 'Todos' },
            ...audiences.map((audience) => ({ value: String(audience.id), label: audience.name }))
          ],
          selectedValue: safeAudienceSelection,
          onSelect: handleAudienceSelect
        })}
      </div>
    </section>
  );
}

export default EventFilters;
