/**
 * Este archivo define la pagina de gestion de organizadores.
 * Solo encapsula el componente CRUD dentro de la navegacion de la aplicacion.
 */
import React from 'react';
import OrganizerManager from '../OrganizerManager';

// Esta pagina monta el gestor de organizadores.
function OrganizersPage() {
  return (
    <main>
      <h2>Gestion de Organizadores</h2>
      <OrganizerManager />
    </main>
  );
}

export default OrganizersPage;
