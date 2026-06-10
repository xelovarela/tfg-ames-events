/**
 * Este archivo implementa el panel reutilizable de filtros de eventos.
 * Recibe estado y callbacks desde sus páginas padre y renderiza una interfaz
 * de chips compartida por mapa y listado.
 */
import React from 'react';
import {
  Baby,
  CalendarDays,
  CircleDot,
  GamepadIcon,
  GraduationCap,
  Grid2x2,
  Heart,
  Leaf,
  MapPin,
  Music2,
  Palette,
  PartyPopper,
  Search,
  SlidersHorizontal,
  ShoppingBasket,
  Tag,
  Trophy,
  UtensilsCrossed,
  Users,
  X
} from 'lucide-react';
import './EventFilters.css';

const DATE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'weekend', label: 'Este finde' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' }
];

function formatAudienceAgeRange(audience) {
  const ageMin = audience.age_min ?? null;
  const ageMax = audience.age_max ?? null;

  if (ageMin === null && ageMax === null) {
    return '0-99';
  }

  if (ageMin !== null && ageMax === null) {
    return `+${ageMin}`;
  }

  if (ageMin === null && ageMax !== null) {
    return `Hasta ${ageMax}`;
  }

  return `${ageMin}-${ageMax}`;
}

function formatAudienceLabel(audience) {
  return `${audience.name} (${formatAudienceAgeRange(audience)})`;
}

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
  if (normalized.includes('fiest')) return <IconParty />;
  if (normalized.includes('gastr')) return <IconFood />;
  if (normalized.includes('mercad')) return <IconStore />;
  if (normalized.includes('teatr')) return <IconCulture />;
  if (normalized.includes('naturaleza') || normalized.includes('naturaleza')) return <IconNature />;
  if (normalized.includes('ocio')) return <IconLeisure />;
  if (normalized.includes('salud')) return <IconHealth />;

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

function IconSearch() {
  return <Search aria-hidden="true" focusable="false" />;
}

function IconMoreFilters() {
  return <SlidersHorizontal aria-hidden="true" focusable="false" />;
}

function IconClear() {
  return <X aria-hidden="true" focusable="false" />;
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

function IconParty() {
  return <PartyPopper aria-hidden="true" focusable="false" />;
}

function IconFood() {
  return <UtensilsCrossed aria-hidden="true" focusable="false" />;
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

function IconNature() {
  return <Leaf aria-hidden="true" focusable="false" />;
}

function IconLeisure() {
  return <GamepadIcon aria-hidden="true" focusable="false" />;
}

function IconHealth() {
  return <Heart aria-hidden="true" focusable="false" />;
}

function EventFilters({
  filters = {
    datePreset: '',
    category: '',
    audienceId: '',
    locality: '',
    freeOnly: false
  },
  categories = [],
  audiences = [],
  locations = [],
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
  const audienceOptions = audiences.map((audience) => ({
    value: String(audience.id),
    label: formatAudienceLabel(audience)
  }));
  const safeDateSelection = DATE_OPTIONS.some((option) => option.value === filters.datePreset) ? filters.datePreset : '';
  const safeCategorySelection = categoryOptions.some((option) => option.value === filters.category) ? filters.category : '';
  const safeAudienceSelection = audiences.some((audience) => String(audience.id) === String(filters.audienceId))
    ? String(filters.audienceId)
    : '';
  const safeLocalitySelection = localityOptions.includes(filters.locality) ? filters.locality : '';
  const searchValue = filters.search || '';

  const hasAnyFilter = Boolean(
    filters.search ||
    filters.datePreset ||
    filters.category ||
    filters.audienceId ||
    filters.locality ||
    filters.freeOnly
  );
  const hasMoreFilters = Boolean(
    filters.audienceId ||
    filters.locality
  );
  const [isMoreOpen, setIsMoreOpen] = React.useState(hasMoreFilters);

  React.useEffect(() => {
    if (hasMoreFilters) {
      setIsMoreOpen(true);
    }
  }, [hasMoreFilters]);

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
    emitChange({ name: 'datePreset', value: safeDateSelection === value ? '' : value });
  };

  const handleCategorySelect = (value) => {
    emitPatch({
      category: safeCategorySelection === value ? '' : value
    });
  };

  const handleAudienceSelect = (value) => {
    emitChange({ name: 'audienceId', value: safeAudienceSelection === value ? '' : value });
  };

  const handleLocalitySelect = (value) => {
    emitChange({ name: 'locality', value: safeLocalitySelection === value ? '' : value });
  };

  const handleAllSelect = () => {
    emitPatch({
      search: '',
      datePreset: '',
      category: '',
      audienceId: '',
      locality: '',
      freeOnly: false
    });
  };

  const handleFreeSelect = () => {
    emitPatch({
      freeOnly: !filters.freeOnly
    });
  };

  const handleSearchChange = (event) => {
    emitChange({ name: 'search', value: event.target.value });
  };

  const getAudienceLabel = (value) => audienceOptions.find((option) => option.value === String(value))?.label || value;
  const getDateLabel = (value) => DATE_OPTIONS.find((option) => option.value === value)?.label || value;

  const activeFilters = [
    filters.search && { key: 'search', label: `Texto: ${filters.search}`, patch: { search: '' } },
    filters.datePreset && { key: 'datePreset', label: getDateLabel(filters.datePreset), patch: { datePreset: '' } },
    filters.category && { key: 'category', label: filters.category, patch: { category: '' } },
    filters.freeOnly && { key: 'freeOnly', label: 'Gratis', patch: { freeOnly: false } },
    filters.locality && { key: 'locality', label: `Ubicación: ${filters.locality}`, patch: { locality: '' } },
    filters.audienceId && { key: 'audienceId', label: `Público: ${getAudienceLabel(filters.audienceId)}`, patch: { audienceId: '' } }
  ].filter(Boolean);

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

  return (
    <section className="event-filters-card">
      <div className="event-filters-topline">
        <div className="event-filters-header">
          <h3>Filtros de eventos</h3>
          <p>Mostrando {filteredCount} de {totalCount} eventos</p>
        </div>

        <div className="event-filters-quick-actions">
          <button
            type="button"
            className={`event-filter-chip event-filter-chip-main${!hasAnyFilter ? ' is-active' : ''}`}
            onClick={handleAllSelect}
            aria-pressed={!hasAnyFilter}
            disabled={!hasAnyFilter}
          >
            <span className="event-filter-chip-icon" aria-hidden="true"><IconGrid /></span>
            Limpiar
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
        </div>
      </div>

      <div className="event-filter-search-row">
        <label className="event-filter-search-label" htmlFor="event-filter-search">
          <span className="event-filter-search-icon" aria-hidden="true"><IconSearch /></span>
          <span className="event-filter-search-text">Buscar eventos</span>
        </label>
        <input
          id="event-filter-search"
          className="event-filter-search-input"
          type="search"
          name="search"
          placeholder="Buscar por título, lugar o descripción"
          value={searchValue}
          onChange={handleSearchChange}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="event-filter-active-summary" aria-label="Filtros activos">
          <span className="event-filter-active-title">Activos</span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className="event-filter-active-chip"
              onClick={() => emitPatch(filter.patch)}
            >
              {filter.label}
              <span className="event-filter-active-icon" aria-hidden="true"><IconClear /></span>
            </button>
          ))}
        </div>
      )}

      <section className="event-filter-section event-filter-section-date" aria-label="Fecha">
        <div className="event-filter-section-head">
          <span className="event-filter-section-icon" aria-hidden="true"><IconCalendar /></span>
          <span className="event-filter-chip-label">Fecha</span>
        </div>
        <div className="event-filter-chip-group" role="group" aria-label="Fechas de eventos">
          {DATE_OPTIONS.filter((option) => option.value).map((option) => {
            const isActive = safeDateSelection === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`event-filter-chip${isActive ? ' is-active' : ''}`}
                onClick={() => handleDateSelect(option.value)}
                aria-pressed={isActive}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="event-filter-section event-filter-section-categories" aria-label="Categorías">
        <div className="event-filter-section-head">
          <span className="event-filter-section-icon" aria-hidden="true"><IconTag /></span>
          <span className="event-filter-chip-label">Categorías</span>
        </div>

        <div className="event-filters-category-grid" role="group" aria-label="Categorías de eventos">
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
      </section>

      <details
        className="event-filters-more"
        open={isMoreOpen}
        onToggle={(event) => setIsMoreOpen(event.currentTarget.open)}
      >
        <summary>
          <span className="event-filter-section-icon" aria-hidden="true"><IconMoreFilters /></span>
          <span>Más filtros</span>
        </summary>

        <div className="event-filters-sections">
          {renderChipSection({
            label: 'Ubicación',
            icon: <IconLocation />,
            options: localityOptions.map((locality) => ({ value: locality, label: locality })),
            selectedValue: safeLocalitySelection,
            onSelect: handleLocalitySelect
          })}

          {renderChipSection({
            label: 'Público',
            icon: <IconUsers />,
            options: audienceOptions,
            selectedValue: safeAudienceSelection,
            onSelect: handleAudienceSelect
          })}
        </div>
      </details>
    </section>
  );
}

export default EventFilters;
