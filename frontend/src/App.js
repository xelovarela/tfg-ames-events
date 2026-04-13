import React from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1>Ames Events</h1>
          <p>Mapa primero, eventos despues y gestion de catalogos</p>
        </header>

        <nav className="app-nav">
          <NavLink to="/map" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Mapa
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Eventos
          </NavLink>
          <NavLink to="/audiences" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Gestion Audiencias
          </NavLink>
          <NavLink to="/organizers" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Gestion Organizadores
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Gestion Categorias
          </NavLink>
          <NavLink to="/locations" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
            Gestion Ubicaciones
          </NavLink>
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
    </BrowserRouter>
  );
}

export default App;
