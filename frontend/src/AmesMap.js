/**
 * Este archivo implementa el componente del mapa interactivo con Leaflet.
 * Puede cargar los eventos por si mismo o recibirlos ya filtrados desde fuera,
 * los agrupa por ubicacion y crea marcadores con informacion resumida.
 */
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config';

const categoryMarkerClass = (category = '') => {
  const normalized = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('deport')) return 'marker-sport';
  if (normalized.includes('educ') || normalized.includes('infantil')) return 'marker-education';
  if (normalized.includes('cultur') || normalized.includes('musica') || normalized.includes('teatro')) return 'marker-culture';
  if (normalized.includes('famil')) return 'marker-family';
  return 'marker-default';
};

const createLocationIcon = (locationGroup) => {
  const primaryCategory = locationGroup.events[0]?.category || '';
  const markerClass = categoryMarkerClass(primaryCategory);
  const count = locationGroup.events.length;

  return L.divIcon({
    className: `event-map-marker ${markerClass}`,
    html: `<span class="event-map-marker-pin"><span>${count}</span></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -38]
  });
};

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M7 3.5v4M17 3.5v4M3.5 9.5h17" />
    </svg>
  );
}

function IconAudience() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="2.4" />
      <circle cx="15.3" cy="9.8" r="2" />
      <path d="M5.3 17.5a3.7 3.7 0 0 1 7.4 0M12 17.5a3.5 3.5 0 0 1 6 0" />
    </svg>
  );
}

function IconOrganizer() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8.2" r="2.8" />
      <path d="M6.3 18a5.7 5.7 0 0 1 11.4 0" />
      <path d="M18.5 9.3h2.8M19.9 7.9v2.8" />
    </svg>
  );
}

function IconAge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 2" />
    </svg>
  );
}

// El componente admite modo controlado y no controlado para reutilizarlo en distintas paginas.
const AmesMap = ({ refreshTrigger, events: externalEvents }) => {
  const amesCenter = [42.8595, -8.65];
  const [groupedLocations, setGroupedLocations] = useState([]);
  const navigate = useNavigate();
  const isControlled = Array.isArray(externalEvents);

  // Formatea fechas de evento para mostrarlas dentro del popup del mapa.
  const formatDate = (value) => {
    if (!value) return 'Sin fecha';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Resume el coste del evento usando un texto corto y legible.
  const formatPrice = (event) => {
    if (Number(event.is_free) === 1) return 'Gratis';
    if (event.price === null || event.price === undefined) return 'De pago';
    return `${Number(event.price).toFixed(2)} EUR`;
  };

  // Resume el rango de edad de cada evento mostrado en el popup.
  const formatAgeRange = (event) => {
    if (event.min_age === null || event.max_age === null) return 'Todas las edades';
    return `${event.min_age}-${event.max_age} anios`;
  };

  // Agrupa eventos por ubicacion para evitar varios marcadores superpuestos en el mismo punto.
  const groupEventsByLocation = (data) => {
    if (!Array.isArray(data)) {
      setGroupedLocations([]);
      return;
    }

    const grouped = {};

    data.forEach((event) => {
      const lat = parseFloat(event.lat);
      const lng = parseFloat(event.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      const key = `${event.location}-${lat}-${lng}`;

      if (!grouped[key]) {
        grouped[key] = {
          location: event.location,
          lat,
          lng,
          events: []
        };
      }

      grouped[key].events.push({
        id: event.id,
        title: event.title,
        category: event.category,
        audience: event.audience,
        organizer: event.organizer,
        event_date: event.event_date,
        is_free: event.is_free,
        price: event.price,
        min_age: event.min_age,
        max_age: event.max_age
      });
    });

    setGroupedLocations(Object.values(grouped));
  };

  // En modo no controlado el propio componente pide los eventos al backend.
  useEffect(() => {
    if (isControlled) {
      return;
    }

    fetch(`${API_BASE_URL}/events`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error('Unexpected /events response for map:', data);
          setGroupedLocations([]);
          return;
        }

        groupEventsByLocation(data);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setGroupedLocations([]);
      });
  }, [refreshTrigger, isControlled]);

  // En modo controlado solo reorganiza los eventos que recibe por props.
  useEffect(() => {
    if (!isControlled) {
      return;
    }

    groupEventsByLocation(externalEvents);
  }, [externalEvents, isControlled]);

  const totalEvents = groupedLocations.reduce((sum, locationGroup) => sum + locationGroup.events.length, 0);

  return (
    <section className="map-shell" aria-label="Mapa de eventos en Ames">
      <div className="map-shell-header">
        <div>
          <p className="map-shell-kicker">Explora el concello</p>
          <h3>Mapa de eventos</h3>
        </div>
        <div className="map-shell-stats" aria-label="Resumen del mapa">
          <span>{totalEvents} eventos</span>
          <span>{groupedLocations.length} ubicaciones</span>
        </div>
      </div>

      <div className="map-frame">
        {/* Contenedor principal del mapa centrado en Ames. */}
        <MapContainer center={amesCenter} zoom={13} className="ames-map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {groupedLocations.map((locationGroup) => (
            <Marker
              key={`${locationGroup.location}-${locationGroup.lat}-${locationGroup.lng}`}
              position={[locationGroup.lat, locationGroup.lng]}
              icon={createLocationIcon(locationGroup)}
            >
              <Popup maxWidth={320} minWidth={220} autoPanPadding={[18, 18]}>
                <div className="map-popup">
                  <span className="map-popup-kicker">Ubicacion</span>
                  <strong className="map-popup-location">{locationGroup.location}</strong>
                  <div className="map-popup-events">
                    {locationGroup.events.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        className="map-event-card"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <span className="map-event-card-topline">
                          <span className="map-event-icon-text">
                            <span className="map-event-icon"><IconCalendar /></span>
                            <span className="map-event-date">{formatDate(event.event_date)}</span>
                          </span>
                          <span className="map-event-price">{formatPrice(event)}</span>
                        </span>
                        <strong>{event.title}</strong>
                        <span className="map-event-meta">
                          <span className="map-event-icon"><IconAudience /></span>
                          {event.category || 'Sin categoria'} / {event.audience || 'General'}
                        </span>
                        <span className="map-event-meta">
                          <span className="map-event-icon"><IconOrganizer /></span>
                          {event.organizer || 'Organizador no especificado'}
                        </span>
                        <span className="map-event-meta map-event-age">
                          <span className="map-event-icon"><IconAge /></span>
                          {formatAgeRange(event)}
                        </span>
                        <span className="map-event-link">Ver detalle</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {groupedLocations.length === 0 && (
          <div className="map-empty-overlay">
            <strong>No hay ubicaciones para mostrar</strong>
            <span>Prueba a cambiar los filtros para volver a llenar el mapa.</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default AmesMap;
