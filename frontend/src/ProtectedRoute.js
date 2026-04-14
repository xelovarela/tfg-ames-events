/**
 * Este archivo define una proteccion simple de rutas privadas.
 * Redirige a login si no hay sesion y bloquea rutas de gestion cuando
 * el usuario autenticado no tiene rol admin.
 */
import React from 'react';
import { Link, Navigate } from 'react-router-dom';

function ProtectedRoute({ session, requireAdmin = false, children }) {
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user?.role === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <main>
        <h2>Acceso restringido</h2>
        <p>Esta seccion es solo para administradores.</p>
        <Link to="/map" className="app-inline-link">
          Volver al mapa
        </Link>
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;
