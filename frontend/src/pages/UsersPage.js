/**
 * Este archivo define la pagina de gestion de usuarios.
 * Actua como contenedor de alto nivel para el componente CRUD
 * encargado de administrar usuarios y asignarles roles.
 */
import React from 'react';
import UserManager from '../UserManager';

function UsersPage() {
  return (
    <main>
      <h2>Gestion de Usuarios</h2>
      <UserManager />
    </main>
  );
}

export default UsersPage;
