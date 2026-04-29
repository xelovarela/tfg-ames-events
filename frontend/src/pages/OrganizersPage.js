/**
 * Este archivo define la página de gestión de organizadores.
 * Solo encapsula el componente CRUD dentro de la navegación de la aplicación.
 */
import React from 'react';
import OrganizerManager from '../OrganizerManager';

// Esta página monta el gestor de organizadores.
function OrganizersPage() {
  return (
    <main>
      <h2>Gestión de Organizadores</h2>
      <OrganizerManager />
    </main>
  );
}

export default OrganizersPage;
