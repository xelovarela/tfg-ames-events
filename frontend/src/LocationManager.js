/**
 * Este archivo implementa el gestor de ubicaciones del frontend.
 * Permite mantener los puntos geograficos disponibles para los eventos mediante
 * formularios con validación local y operaciones CRUD contra la API.
 */
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
import MapContextLayers from './MapContextLayers';
import { readJsonResponse } from './utils/http';
import './LocationManager.css';

const AMES_CENTER = [42.8595, -8.65];
const AMES_DEFAULT_ZOOM = 13;
const SELECTED_LOCATION_ZOOM = 16;

// Estado base del formulario de ubicaciones.
const initialForm = {
  name: '',
  locality: 'Bertamiráns',
  lat: '',
  lng: ''
};

const LOCALITY_OPTIONS = ['Bertamiráns', 'Milladoiro', 'Otras parroquias'];

const selectedLocationIcon = L.divIcon({
  className: 'location-picker-marker',
  html: '<span class="location-picker-marker-pin" aria-hidden="true"></span>',
  iconSize: [34, 42],
  iconAnchor: [17, 40],
  popupAnchor: [0, -36]
});

const existingLocationIcon = L.divIcon({
  className: 'location-existing-marker',
  html: '<span class="location-existing-marker-dot" aria-hidden="true"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -12]
});

function getSelectedPosition(form) {
  if (form.lat === '' || form.lng === '') {
    return null;
  }

  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
}

function getLocationPosition(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lat, lng];
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    }
  });

  return null;
}

function MapCenterSync({ position }) {
  const map = useMap();

  useEffect(() => {
    window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    if (position) {
      map.setView(position, Math.max(map.getZoom(), SELECTED_LOCATION_ZOOM), { animate: true });
    } else {
      map.setView(AMES_CENTER, AMES_DEFAULT_ZOOM, { animate: true });
    }
  }, [map, position]);

  return null;
}

// Valida nombre y coordenadas antes de persistir una ubicación.
function validateLocation(form) {
  const name = form.name.trim();
  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (!name || name.length > 150) {
    return 'El nombre es obligatorio y debe tener entre 1 y 150 caracteres.';
  }

  if (!LOCALITY_OPTIONS.includes(form.locality)) {
    return 'La localidad es obligatoria.';
  }

  if (!form.lat || !form.lng) {
    return 'Selecciona la ubicación en el mapa antes de guardar.';
  }

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return 'Latitud invalida. Debe estar entre -90 y 90.';
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return 'Longitud invalida. Debe estar entre -180 y 180.';
  }

  return null;
}

// Este componente concentra la logica CRUD de ubicaciones.
function LocationManager({ onLocationsChanged }) {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showExistingLocations, setShowExistingLocations] = useState(true);
  const [showAreas, setShowAreas] = useState(false);
  const selectedPosition = getSelectedPosition(formData);
  const referenceLocations = locations.filter((location) => location.id !== editingId);

  // Recupera el catálogo completo de ubicaciones desde la API.
  const loadLocations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations`);
      const data = await readJsonResponse(response, 'No se pudieron cargar las ubicaciones');
      setLocations(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // La carga inicial se realiza una sola vez al montar el componente.
  useEffect(() => {
    loadLocations();
  }, []);

  // Sincroniza los inputs del formulario con el estado local.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      lat: latlng.lat.toFixed(7),
      lng: latlng.lng.toFixed(7)
    }));
    setMessage('');
  };

  // Limpia el formulario y desactiva el modo edición.
  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  // Crea o actualiza la ubicación según el estado actual del formulario.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const validationError = validateLocation(formData);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = {
      name: formData.name.trim(),
      locality: formData.locality,
      lat: Number(formData.lat),
      lng: Number(formData.lng)
    };

    const endpoint = editingId
      ? `${API_BASE_URL}/locations/${editingId}`
      : `${API_BASE_URL}/locations`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      await readJsonResponse(response, 'Error guardando ubicación');

      setMessage(editingId ? 'Ubicacion actualizada correctamente.' : 'Ubicacion creada correctamente.');
      clearForm();
      await loadLocations();
      if (onLocationsChanged) {
        onLocationsChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando ubicación');
    } finally {
      setIsSaving(false);
    }
  };

  // Carga una ubicación existente en el formulario para editarla.
  const handleEdit = (location) => {
    setEditingId(location.id);
    setFormData({
      name: location.name,
      locality: location.locality,
      lat: String(location.lat),
      lng: String(location.lng)
    });
    setMessage('');
  };

  // Elimina una ubicación tras confirmación del usuario.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta ubicación?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });
      await readJsonResponse(response, 'Error eliminando ubicación');

      setMessage('Ubicacion eliminada correctamente.');
      await loadLocations();
      if (onLocationsChanged) {
        onLocationsChanged();
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando ubicación');
    }
  };

  return (
    <section className="locations-card">
      <h3 className="locations-title">Gestión de ubicaciones</h3>

      {/* Formulario principal para crear y editar ubicaciones. */}
      <form className="locations-form" onSubmit={handleSubmit}>
        <div className="locations-form-grid">
          <label className="locations-field">
            <span>Nombre</span>
            <input
              className="locations-input"
              type="text"
              name="name"
              placeholder="Nombre de la ubicación"
              value={formData.name}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </label>

          <label className="locations-field">
            <span>Localidad</span>
            <select
              className="locations-input"
              name="locality"
              value={formData.locality}
              onChange={handleChange}
              required
            >
              {LOCALITY_OPTIONS.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="locations-map-section">
          <div className="locations-map-copy">
            <div>
              <strong>Selecciona el punto en el mapa</strong>
              <span>Haz clic para colocar el marcador o arrastralo para ajustar la posicion.</span>
            </div>
            <div className="locations-map-toggles" aria-label="Opciones del mapa de ubicaciones">
              <label>
                <input
                  type="checkbox"
                  checked={showExistingLocations}
                  onChange={(event) => setShowExistingLocations(event.target.checked)}
                />
                Mostrar ubicaciones existentes
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showAreas}
                  onChange={(event) => setShowAreas(event.target.checked)}
                />
                Mostrar areas
              </label>
            </div>
          </div>

          <div className="locations-map-frame">
            <MapContainer
              center={selectedPosition || AMES_CENTER}
              zoom={selectedPosition ? SELECTED_LOCATION_ZOOM : AMES_DEFAULT_ZOOM}
              className="locations-map"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapContextLayers visible={showAreas} interactive={false} />
              <MapClickHandler onSelect={handleMapSelect} />
              <MapCenterSync position={selectedPosition} />
              {showExistingLocations && referenceLocations.map((location) => {
                const position = getLocationPosition(location);

                if (!position) {
                  return null;
                }

                return (
                  <Marker
                    key={location.id}
                    position={position}
                    icon={existingLocationIcon}
                    bubblingMouseEvents={false}
                  >
                    <Popup>
                      <strong>{location.name}</strong>
                      {location.locality && <span>{location.locality}</span>}
                    </Popup>
                  </Marker>
                );
              })}
              {selectedPosition && (
                <Marker
                  position={selectedPosition}
                  icon={selectedLocationIcon}
                  draggable
                  eventHandlers={{
                    dragend(event) {
                      handleMapSelect(event.target.getLatLng());
                    }
                  }}
                />
              )}
            </MapContainer>
            <div className="locations-map-legend" aria-label="Leyenda del mapa">
              <span><i className="locations-legend-selected" aria-hidden="true" /> Punto seleccionado</span>
              <span><i className="locations-legend-existing" aria-hidden="true" /> Ubicaciones existentes</span>
              {showAreas && <span><i className="locations-legend-area" aria-hidden="true" /> Areas</span>}
            </div>
          </div>
        </div>

        <div className="locations-coordinate-grid">
          <label className="locations-field">
            <span>Latitud</span>
            <input
              className="locations-input"
              type="number"
              name="lat"
              placeholder="Selecciona un punto en el mapa"
              step="0.0000001"
              value={formData.lat}
              readOnly
              required
            />
          </label>

          <label className="locations-field">
            <span>Longitud</span>
            <input
              className="locations-input"
              type="number"
              name="lng"
              placeholder="Selecciona un punto en el mapa"
              step="0.0000001"
              value={formData.lng}
              readOnly
              required
            />
          </label>
        </div>

        <div className="locations-actions">
          <button className="locations-btn locations-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear ubicación'}
          </button>

          {editingId && (
            <button className="locations-btn locations-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="locations-message">{message}</p>}

      <div className="locations-list">
        {locations.length === 0 ? (
          <p>No hay ubicaciones registradas.</p>
        ) : (
          locations.map((location) => (
            <article className="locations-item" key={location.id}>
              <strong>{location.name}</strong>
              <p>Localidad: {location.locality}</p>
              <p>Lat: {location.lat}</p>
              <p>Lng: {location.lng}</p>
              <div className="locations-item-actions">
                <button className="locations-btn locations-btn-secondary" onClick={() => handleEdit(location)}>
                  Editar
                </button>
                <button className="locations-btn locations-btn-danger" onClick={() => handleDelete(location.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default LocationManager;
