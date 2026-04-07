import React from 'react';
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

const AmesMap = () => {
  // Coordenadas aproximadas de Ames (Bertamiráns)
  const amesCenter = [42.8595, -8.6500];

  // Datos de prueba (Simulando la base de datos de la CAT3)
  const mockEvents = [
    { id: 1, title: "Concierto en Bertamiráns", pos: [42.8590, -8.6510], category: "Música" },
    { id: 2, title: "Teatro Milladoiro", pos: [42.8640, -8.6320], category: "Teatro" }
  ];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <h3>Prototype CAT2</h3>
      <MapContainer center={amesCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mockEvents.map(event => (
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