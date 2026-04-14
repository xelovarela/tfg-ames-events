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

// Leaflet necesita esta correccion para resolver bien las rutas de sus iconos en React.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
      const key = `${event.location}-${event.lat}-${event.lng}`;

      if (!grouped[key]) {
        grouped[key] = {
          location: event.location,
          lat: parseFloat(event.lat),
          lng: parseFloat(event.lng),
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

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <h3>Prototype CAT3</h3>
      {/* Contenedor principal del mapa centrado en Ames. */}
      <MapContainer center={amesCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {groupedLocations.map((locationGroup, index) => (
          <Marker key={index} position={[locationGroup.lat, locationGroup.lng]}>
            <Popup>
              <div className="map-popup">
                <strong className="map-popup-location">{locationGroup.location}</strong>
                <div className="map-popup-events">
                {locationGroup.events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className="map-event-card"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <strong>{event.title}</strong>
                    <br />
                    Categoria: {event.category}
                    <br />
                    Audiencia: {event.audience || 'General'}
                    <br />
                    Organizador: {event.organizer || 'No especificado'}
                    <br />
                    Fecha: {formatDate(event.event_date)}
                    <br />
                    Precio: {formatPrice(event)}
                    <br />
                    Edad: {formatAgeRange(event)}
                  </button>
                ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AmesMap;
