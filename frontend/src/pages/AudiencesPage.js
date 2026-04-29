/**
 * Este archivo define la página de gestión de audiencias.
 * Permite integrar el componente de administración dentro del layout general.
 */
import React from 'react';
import AudienceManager from '../AudienceManager';

// Esta página monta el gestor de audiencias.
function AudiencesPage() {
  return (
    <main>
      <h2>Gestión de Audiencias</h2>
      <AudienceManager />
    </main>
  );
}

export default AudiencesPage;
