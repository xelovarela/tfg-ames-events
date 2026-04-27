# Capas Contextuales del Mapa - Guía para Mejoras Futuras

## Archivos Relacionados

- `frontend/src/MapContextLayers.js` - Componente principal
- `frontend/src/MapContextLayers.css` - Estilos de las capas
- `frontend/src/public/data/ames-boundary.geojson` - Límite del Concello (placeholder)
- `frontend/src/AmesMap.js` - Integración en el mapa principal

## Estado Actual

### Implementado
- ✅ Zona de **Bertamiráns**: Círculo de 950 metros (aproximado)
- ✅ Zona de **O Milladoiro**: Círculo de 850 metros (aproximado)
- ✅ Límite de **Ames**: GeoJSON real obtenido desde Overpass Turbo / OpenStreetMap
- ✅ Etiquetas permanentes y legibles
- ✅ Estilos suave que no interfieren con marcadores
- ✅ Control mediante prop `showContextLayers` en AmesMap

### Cómo Usar

El componente está activado por defecto, pero puede desactivarse:

```jsx
// En MapPage.js o donde se use AmesMap:
<AmesMap events={filteredEvents} showContextLayers={true} />
```

## Mejora Futura: Sustituir Círculos por Límites GeoJSON Reales

### Opción 1: Agregar GeoJSON para Bertamiráns

1. **Obtener el GeoJSON**:
   - Usar una herramienta como [geojson.io](https://geojson.io)
   - O descargar desde [OpenStreetMap Overpass API](https://overpass-turbo.osm.de/)
   - O crear manualmente dibujando en geojson.io

2. **Crear archivo** `frontend/src/data/bertamiranes-boundary.geojson`

3. **En MapContextLayers.js**, añadir un hook similar a `useBoundaryGeoJSON`:

```jsx
const useBertamiransGeoJSON = () => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/data/bertamiranes-boundary.geojson')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setGeoData(data))
      .catch(() => console.warn('GeoJSON Bertamiráns no encontrado'));
  }, []);

  return geoData;
};
```

4. **En el JSX**, reemplazar el Circle:

```jsx
{showZones && bertamiransGeoData && (
  <GeoJSON 
    data={bertamiransGeoData} 
    style={{
      color: '#2ecc71',
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.05,
      fillColor: '#2ecc71'
    }}
  />
)}
```

### Opción 2: Usar Límites Administrativos de OpenStreetMap

Si necesitas límites precisos y oficiales:

1. **Usar Overpass API** para consultar límites:
```
[bbox:42.84,−8.72,42.88,−8.53];
relation["boundary"="administrative"]["admin_level"="8"]["name"="Ames"];
out geojson;
```

2. **Guardar resultado** como GeoJSON

3. **Integrar como se indica en Opción 1**

### Opción 3: Servicio Web GeoJSON (Dinámico)

Para límites que se actualicen:

```jsx
const useDynamicBoundary = (boundaryName) => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    // Llamar a servicio de mapas que devuelva GeoJSON
    fetch(`/api/boundaries/${boundaryName}`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.warn(error));
  }, [boundaryName]);

  return geoData;
};
```

## Pasos Específicos para Sustituir Círculos

### Para Bertamiráns:

1. Obtener GeoJSON (ver Opciones arriba)
2. Guardar en `frontend/src/data/bertamiranes-boundary.geojson`
3. En `MapContextLayers.js`:
   - Añadir `useBertamiransGeoJSON()` hook
   - Reemplazar el `<Circle>` de Bertamiráns con `<GeoJSON>`
   - Mantener el `<Tooltip>` para la etiqueta

### Para O Milladoiro:

Mismo proceso que Bertamiráns

### Para Límite de Ames:

El archivo `ames-boundary.geojson` ya existe. Solo necesita:
1. Obtener los datos reales del límite oficial
2. Reemplazar el contenido del JSON manteniendo la estructura:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Concello de Ames",
        "description": "Límite oficial"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          // Insertar aquí las coordenadas reales
        ]
      }
    }
  ]
}
```

## Fuentes de Datos Oficiales

- **IGN (Instituto Geográfico Nacional)**: Límites administrativos precisos
- **OpenStreetMap**: Comunidad colaborativa, generalmente completo
- **Xunta de Galicia**: Datos oficiales de Galicia
- **Ayuntamiento de Ames**: Contactar directamente si existen bases de datos SIG

## Rendimiento

- Los GeoJSON se cargan una sola vez en el montaje del componente
- Si hay error al cargar, las capas simplemente no se renderizan
- Los círculos son más ligeros que polígonos complejos (actual es el balance)

## Testing

Después de cambiar círculos por GeoJSON:

```jsx
// En AmesMap o MapPage, verificar:
<AmesMap 
  events={events}
  showContextLayers={true}  // Visible
/>

<AmesMap 
  events={events}
  showContextLayers={false}  // Oculto
/>
```

## Modificar Estilos

Si necesitas cambiar colores o transparencia:

1. Editar `BOUNDARY_STYLE` en MapContextLayers.js
2. Editar `ZONE_CONFIG` en MapContextLayers.js
3. Editar `MapContextLayers.css` para tooltips

Ejemplo:
```jsx
const BOUNDARY_STYLE = {
  color: '#e74c3c',  // Rojo
  fillOpacity: 0.1,  // Más opaco
  // ...
};
```

## Preguntas Frecuentes

**P: ¿Interfieren las capas con los marcadores de eventos?**
R: No. Los círculos/polígonos tienen z-index bajo (400), los marcadores están encima.

**P: ¿Se pueden activar/desactivar las capas por zona?**
R: Sí. Añade props en MapContextLayers:
```jsx
<MapContextLayers 
  showBoundary={true}
  showZones={true}
  showBertamiranes={true}
  showMilladoiro={false}
/>
```

**P: ¿Cómo cambiar el radio de los círculos aproximados?**
R: Edita `ZONE_CONFIG` en MapContextLayers.js:
```jsx
bertamiranes: {
  radius: 1200,  // metros (antes 900)
  // ...
}
```

## Validación de GeoJSON

Usa [geojson.io](https://geojson.io) o [jsonlint.com](https://jsonlint.com) para validar:
```bash
# O en terminal (si tienes Node):
node -e "console.log(JSON.parse(require('fs').readFileSync('ames-boundary.geojson')))"
```
