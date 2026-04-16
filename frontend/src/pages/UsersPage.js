/**
 * Este archivo define la pagina de gestion de usuarios.
 * Actua como contenedor de alto nivel para el componente encargado
 * de administrar roles y estado de usuarios.
 */
import React from 'react';
import UserManager from '../UserManager';

function UsersPage({ session }) {
  return (
    <main>
      <h2>Gestion de Usuarios</h2>
      <UserManager session={session} />
    </main>
  );
}

export default UsersPage;
