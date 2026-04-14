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

// Esta constante describe las opciones visibles en el menu lateral de navegacion.
const NAV_ITEMS = [
  { to: '/map', label: 'Mapa' },
  { to: '/events', label: 'Eventos' },
  { to: '/audiences', label: 'Audiencias' },
  { to: '/organizers', label: 'Organizadores' },
  { to: '/categories', label: 'Categorias' },
  { to: '/locations', label: 'Ubicaciones' }
];

// Este componente monta la interfaz comun compartida por todas las paginas.
function AppShell({ session, onLogout, onSessionChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get('search') || '';
  const isAuthenticated = Boolean(session?.token);

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
        {NAV_ITEMS.map((item) => (
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
          <Route path="/events/new" element={<EventCreatePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/edit" element={<EventEditPage />} />

          <Route path="/audiences" element={<AudiencesPage />} />
          <Route path="/organizers" element={<OrganizersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/locations" element={<LocationsPage />} />
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
