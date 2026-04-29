/**
 * Este archivo define la página de gestión de ubicaciones.
 * Su única tarea es renderizar el componente especializado que mantiene el CRUD.
 */
import React from 'react';
import LocationManager from '../LocationManager';

// Esta página sirve de contenedor para el gestor de ubicaciones.
function LocationsPage() {
  return (
    <main>
      <h2>Gestión de Ubicaciones</h2>
      <LocationManager />
    </main>
  );
}

export default LocationsPage;
