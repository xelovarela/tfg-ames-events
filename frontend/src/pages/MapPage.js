import React from 'react';
import AmesMap from '../AmesMap';

function MapPage() {
  return (
    <main>
      <h2>Mapa de Eventos</h2>
      <AmesMap refreshTrigger={0} />
    </main>
  );
}

export default MapPage;
