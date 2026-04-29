/**
 * Este archivo define una proteccion simple de rutas privadas.
 * Redirige a login si no hay sesión y bloquea rutas de gestión cuándo
 * el usuario autenticado no tiene rol admin.
 */
import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ session, requireAdmin = false, allowedRoles = null, children }) {
  const location = useLocation();
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user?.role === 'admin';
  const userRole = session?.user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // El rol admin tiene acceso transversal a rutas con allowedRoles.
  if (!isAdmin && Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <main>
        <h2>Acceso restringido</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
        <Link to="/map" className="app-inline-link">
          Volver al mapa
        </Link>
      </main>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <main>
        <h2>Acceso restringido</h2>
        <p>Esta sección es solo para administradores.</p>
        <Link to="/map" className="app-inline-link">
          Volver al mapa
        </Link>
      </main>
    );
  }

  return children;
}

export default ProtectedRoute;
