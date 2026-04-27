/**
 * Componente para capas contextuales geográficas del mapa de Ames.
 * Añade límites municipales, zonas (Bertamiráns, O Milladoiro) y etiquetas.
 * Las capas se visualizan bajo los marcadores de eventos.
 */
import React, { useEffect, useState } from 'react';
import { GeoJSON, Circle, Tooltip } from 'react-leaflet';
import './MapContextLayers.css';

/**
 * Configuración de las zonas geográficas.
 * Las coordenadas son aproximadas para dar contexto visual.
 */
const ZONE_CONFIG = {
  bertamiranes: {
    center: [42.8646, -8.6477],
    radius: 950,
    label: 'Bertamiráns',
    color: '#2ecc71',
    fillOpacity: 0.18,
    weight: 3.5
  },
  milladoiro: {
    center: [42.8455, -8.5818],
    radius: 850,
    label: 'O Milladoiro',
    color: '#f39c12',
    fillOpacity: 0.18,
    weight: 3.5
  }
};

/**
 * Estilos para el GeoJSON del límite municipal.
 */
const BOUNDARY_STYLE = {
  color: '#e74c3c',
  weight: 3,
  opacity: 0.8,
  fillOpacity: 0.12,
  fillColor: '#e74c3c',
  dashArray: '5, 5'
};

/**
 * Maneja el evento de clic del GeoJSON (opcional para comportamientos futuros).
 */
const onEachFeature = (feature, layer) => {
  const props = feature.properties || {};
  const name = props.name || 'Área';
  const description = props.description || '';

  let popupContent = `<strong>${name}</strong>`;
  if (description) {
    popupContent += `<br /><small>${description}</small>`;
  }

  layer.bindPopup(popupContent);
};

/**
 * Intenta cargar el GeoJSON del límite del Concello.
 * Devuelve null si no existe o hay error; la capa simplemente no se renderiza.
 */
const useBoundaryGeoJSON = () => {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/ames-boundary.geojson')
      .then((res) => {
        if (!res.ok) {
          console.warn('GeoJSON del límite municipal no encontrado (esto es normal en desarrollo)');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.warn('No se pudo cargar el GeoJSON del límite:', error.message);
        setLoading(false);
      });
  }, []);

  return { geoData, loading };
};

/**
 * Componente de capas contextuales.
 * @param {boolean} [visible=true] - Si false, no renderiza las capas.
 * @param {boolean} [showBoundary=true] - Si false, oculta el límite municipal.
 * @param {boolean} [showZones=true] - Si false, oculta las zonas.
 */
function MapContextLayers({ visible = true, showBoundary = true, showZones = true }) {
  const { geoData } = useBoundaryGeoJSON();

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Límite del Concello de Ames (si existe GeoJSON) */}
      {showBoundary && geoData && (
        <GeoJSON data={geoData} style={BOUNDARY_STYLE} onEachFeature={onEachFeature} />
      )}

      {/* Zonas aproximadas con Circle */}
      {showZones && (
        <>
          {/* Bertamiráns */}
          <Circle
            center={ZONE_CONFIG.bertamiranes.center}
            radius={ZONE_CONFIG.bertamiranes.radius}
            pathOptions={{
              color: ZONE_CONFIG.bertamiranes.color,
              weight: ZONE_CONFIG.bertamiranes.weight,
              opacity: 0.5,
              fill: true,
              fillOpacity: ZONE_CONFIG.bertamiranes.fillOpacity,
              fillColor: ZONE_CONFIG.bertamiranes.color
            }}
          >
            <Tooltip
              permanent
              direction="center"
              className="map-zone-tooltip"
            >
              <strong>{ZONE_CONFIG.bertamiranes.label}</strong>
            </Tooltip>
          </Circle>

          {/* O Milladoiro */}
          <Circle
            center={ZONE_CONFIG.milladoiro.center}
            radius={ZONE_CONFIG.milladoiro.radius}
            pathOptions={{
              color: ZONE_CONFIG.milladoiro.color,
              weight: ZONE_CONFIG.milladoiro.weight,
              opacity: 0.5,
              fill: true,
              fillOpacity: ZONE_CONFIG.milladoiro.fillOpacity,
              fillColor: ZONE_CONFIG.milladoiro.color
            }}
          >
            <Tooltip
              permanent
              direction="center"
              className="map-zone-tooltip"
            >
              <strong>{ZONE_CONFIG.milladoiro.label}</strong>
            </Tooltip>
          </Circle>
        </>
      )}
    </>
  );
}

export default MapContextLayers;
