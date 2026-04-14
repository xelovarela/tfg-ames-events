/**
 * Este archivo define la pagina de gestion de audiencias.
 * Permite integrar el componente de administracion dentro del layout general.
 */
import React from 'react';
import AudienceManager from '../AudienceManager';

// Esta pagina monta el gestor de audiencias.
function AudiencesPage() {
  return (
    <main>
      <h2>Gestion de Audiencias</h2>
      <AudienceManager />
    </main>
  );
}

export default AudiencesPage;
