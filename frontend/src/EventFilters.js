/**
 * Este archivo implementa el panel reutilizable de filtros de eventos.
 * Recibe estado y callbacks desde sus paginas padre y renderiza una interfaz
 * de chips compartida por mapa y listado.
 */
import React from 'react';
import {
  Baby,
  CalendarDays,
  CircleDot,
  GraduationCap,
  Grid2x2,
  MapPin,
  Music2,
  Palette,
  ShoppingBasket,
  Tag,
  Trophy,
  Users
} from 'lucide-react';
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
  const normalized = String(categoryName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
  return <CalendarDays aria-hidden="true" focusable="false" />;
}

function IconLocation() {
  return <MapPin aria-hidden="true" focusable="false" />;
}

function IconUsers() {
  return <Users aria-hidden="true" focusable="false" />;
}

function IconGrid() {
  return <Grid2x2 aria-hidden="true" focusable="false" />;
}

function IconTag() {
  return <Tag aria-hidden="true" focusable="false" />;
}

function IconDot() {
  return <CircleDot aria-hidden="true" focusable="false" />;
}

function IconMusic() {
  return <Music2 aria-hidden="true" focusable="false" />;
}

function IconSport() {
  return <Trophy aria-hidden="true" focusable="false" />;
}

function IconCulture() {
  return <Palette aria-hidden="true" focusable="false" />;
}

function IconEducation() {
  return <GraduationCap aria-hidden="true" focusable="false" />;
}

function IconKids() {
  return <Baby aria-hidden="true" focusable="false" />;
}

function IconStore() {
  return <ShoppingBasket aria-hidden="true" focusable="false" />;
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
