/**
 * Este archivo define la pagina de gestion de ubicaciones.
 * Su unica tarea es renderizar el componente especializado que mantiene el CRUD.
 */
import React from 'react';
import LocationManager from '../LocationManager';

// Esta pagina sirve de contenedor para el gestor de ubicaciones.
function LocationsPage() {
  return (
    <main>
      <h2>Gestion de Ubicaciones</h2>
      <LocationManager />
    </main>
  );
}

export default LocationsPage;
