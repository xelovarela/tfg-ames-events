import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
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

const NAV_ITEMS = [
  { to: '/map', label: 'Mapa' },
  { to: '/events', label: 'Eventos' },
  { to: '/audiences', label: 'Audiencias' },
  { to: '/organizers', label: 'Organizadores' },
  { to: '/categories', label: 'Categorias' },
  { to: '/locations', label: 'Ubicaciones' }
];

function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-container">
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
            <input type="text" placeholder="Buscar eventos..." className="app-search" />
          </div>

          <button type="button" className="app-icon-btn" aria-label="Perfil de usuario">
            <span className="app-icon" aria-hidden="true">U</span>
          </button>
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

          <Route path="*" element={<p className="app-not-found">Ruta no encontrada.</p>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Angel Varela - 2026</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
