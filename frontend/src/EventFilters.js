/**
 * Este archivo implementa el panel reutilizable de filtros de eventos.
 * Recibe estado y callbacks desde sus paginas padre y solo se ocupa de renderizar
 * los controles que permiten refinar el listado o el mapa.
 */
import React from 'react';
import './EventFilters.css';

// Este componente es presentacional: muestra filtros y propaga los cambios hacia arriba.
function EventFilters({
  filters = {
    category: '',
    audienceId: '',
    location: '',
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
  onClear = () => {}
}) {
  return (
    <section className="event-filters-card">
      {/* Cabecera con resumen de eventos totales frente a eventos visibles. */}
      <div className="event-filters-header">
        <h3>Filtros de eventos</h3>
        <p>
          Mostrando {filteredCount} de {totalCount} eventos
        </p>
      </div>

      {/* Controles de filtrado por catalogos, edad y gratuidad. */}
      <div className="event-filters-grid">
        <label>
          Categoria
          <select
            name="category"
            value={filters.category}
            onChange={onChange}
            className="event-filters-input"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Audiencia
          <select
            name="audienceId"
            value={filters.audienceId}
            onChange={onChange}
            className="event-filters-input"
          >
            <option value="">Todas</option>
            {audiences.map((audience) => (
              <option key={audience.id} value={audience.id}>
                {audience.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ubicacion
          <select
            name="location"
            value={filters.location}
            onChange={onChange}
            className="event-filters-input"
          >
            <option value="">Todas</option>
            {locations.map((location) => (
              <option key={location.id} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Organizador
          <select
            name="organizerId"
            value={filters.organizerId}
            onChange={onChange}
            className="event-filters-input"
          >
            <option value="">Todos</option>
            {organizers.map((organizer) => (
              <option key={organizer.id} value={organizer.id}>
                {organizer.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Edad compatible
          <input
            type="number"
            min="0"
            step="1"
            name="compatibleAge"
            value={filters.compatibleAge}
            onChange={onChange}
            className="event-filters-input"
            placeholder="Ej: 6"
          />
        </label>

        <label className="event-filters-checkbox">
          <input
            type="checkbox"
            name="freeOnly"
            checked={filters.freeOnly}
            onChange={onChange}
          />
          Solo gratis
        </label>
      </div>

      {/* Accion para volver rapidamente al estado inicial del buscador. */}
      <div className="event-filters-actions">
        <button type="button" className="event-filters-clear" onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}

export default EventFilters;
