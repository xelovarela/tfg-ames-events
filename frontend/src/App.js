/**
 * Este archivo define el contenedor principal del frontend.
 * Configura el enrutado de React Router, el menu lateral, la cabecera comun y
 * la distribucion general de la aplicacion de Ames Events.
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import './App.css';
import MapPage from './pages/MapPage';
import EventsPage from './pages/EventsPage';
import AudiencesPage from './pages/AudiencesPage';
import OrganizersPage from './pages/OrganizersPage';
import EventDetailPage from './pages/EventDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import LocationsPage from './pages/LocationsPage';
import EventCreatePage from './pages/EventCreatePage';
import EventEditPage from './pages/EventEditPage';
import LoginPage from './pages/LoginPage';
import { clearAuthSession, getAuthSession } from './utils/authStorage';
import ProtectedRoute from './ProtectedRoute';
import UsersPage from './pages/UsersPage';

// Esta constante describe las opciones visibles en el menu lateral de navegacion.
const NAV_ITEMS = [
  { to: '/map', label: 'Mapa' },
  { to: '/events', label: 'Eventos' },
  { to: '/audiences', label: 'Audiencias', adminOnly: true },
  { to: '/organizers', label: 'Organizadores', adminOnly: true },
  { to: '/categories', label: 'Categorias', adminOnly: true },
  { to: '/locations', label: 'Ubicaciones', adminOnly: true },
  { to: '/users', label: 'Usuarios', adminOnly: true }
];

// Este componente monta la interfaz comun compartida por todas las paginas.
function AppShell({ session, onLogout, onSessionChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get('search') || '';
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user?.role === 'admin';
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  // Cuando cambia la ruta se cierra el menu movil para mejorar la experiencia de uso.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Mantiene el buscador de la cabecera sincronizado con la URL para reutilizar el sistema actual de filtros.
  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextValue.trim()) {
      nextSearchParams.set('search', nextValue);
    } else {
      nextSearchParams.delete('search');
    }

    setSearchParams(nextSearchParams);
  };

  return (
    <div className="app-container">
      {/* Cabecera superior con boton de menu, buscador visual y acceso de usuario. */}
      <header className="app-topbar">
        <div className="app-topbar-inner">
          <button
            type="button"
            className="app-icon-btn"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="app-hamburger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <div className="app-search-wrap">
            <input
              type="text"
              placeholder="Buscar eventos..."
              className="app-search"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>

          <div className="app-auth-wrap">
            {isAuthenticated ? (
              <>
                <span className="app-auth-user">
                  {session.user?.username || 'Usuario'}
                </span>
                <button type="button" className="app-auth-btn" onClick={onLogout}>
                  Cerrar sesion
                </button>
              </>
            ) : (
              <Link to="/login" className="app-auth-link">
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && <button type="button" className="app-menu-backdrop" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menu" />}

      <nav className={`app-drawer${isMenuOpen ? ' open' : ''}`}>
        <h1 className="app-title">Ames Events</h1>
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Zona principal donde React Router va renderizando cada pagina. */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />

          <Route path="/map" element={<MapPage />} />

          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/events/new"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <EventCreatePage />
              </ProtectedRoute>
            )}
          />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route
            path="/events/:id/edit"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <EventEditPage />
              </ProtectedRoute>
            )}
          />

          <Route
            path="/audiences"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <AudiencesPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/organizers"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <OrganizersPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/categories"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <CategoriesPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/locations"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <LocationsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/users"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <UsersPage />
              </ProtectedRoute>
            )}
          />
          <Route path="/login" element={<LoginPage onLogin={onSessionChange} />} />

          <Route path="*" element={<p className="app-not-found">Ruta no encontrada.</p>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Angel Varela - 2026</p>
      </footer>
    </div>
  );
}

// Este componente envuelve toda la aplicacion con el router del navegador.
function App() {
  const [session, setSession] = useState(() => getAuthSession());

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
  };

  const syncSessionFromStorage = () => {
    setSession(getAuthSession());
  };

  return (
    <BrowserRouter>
      <AppShell session={session} onLogout={handleLogout} onSessionChange={syncSessionFromStorage} />
    </BrowserRouter>
  );
}

// Se exporta el componente raiz consumido desde index.js.
export default App;
