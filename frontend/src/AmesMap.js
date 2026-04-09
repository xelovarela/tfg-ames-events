import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrección para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AmesMap = ({ refreshTrigger }) => {
  const amesCenter = [42.8595, -8.6500];
  const [events, setEvents] = useState([]);

  const loadEvents = () => {
    fetch('http://localhost:3001/events')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(e => ({
          id: e.id,
          title: e.title,
          category: e.category,
          pos: [parseFloat(e.lat), parseFloat(e.lng)]
        }));
        setEvents(formatted);
      })
      .catch(err => console.error('Error fetching events:', err));
  };

  useEffect(() => {
    loadEvents();
  }, [refreshTrigger]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <h3>Prototype CAT3</h3>
      <MapContainer center={amesCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {events.map(event => (
          <Marker key={event.id} position={event.pos}>
            <Popup>
              <strong>{event.title}</strong> <br />
              Categoría: {event.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AmesMap;