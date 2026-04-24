/**
 * Este archivo define el contenedor principal del frontend.
 * Configura el enrutado de React Router, el menu lateral, la cabecera comun y
 * la distribucion general de la aplicacion de Eventos en Ames.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import './styles/topbar.css';
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
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import AlertsPage from './pages/AlertsPage';
import { AUTH_SESSION_EVENT, clearAuthSession, getAuthSession } from './utils/authStorage';
import ProtectedRoute from './ProtectedRoute';
import UsersPage from './pages/UsersPage';

// Esta constante describe las opciones visibles en el menu lateral de navegacion.
const NAV_ITEMS = [
  { to: '/map', label: 'Mapa' },
  { to: '/events', label: 'Eventos' },
  { to: '/favorites', label: 'Mis favoritos', allowedRoles: ['user', 'admin'] },
  { to: '/alerts', label: 'Alertas', authenticatedOnly: true },
  { to: '/audiences', label: 'Audiencias', adminOnly: true },
  { to: '/organizers', label: 'Organizadores', allowedRoles: ['admin', 'content_manager'] },
  { to: '/categories', label: 'Categorias', allowedRoles: ['admin', 'content_manager'] },
  { to: '/locations', label: 'Ubicaciones', allowedRoles: ['admin', 'content_manager'] },
  { to: '/admin/users', label: 'Usuarios', adminOnly: true }
];

function getUserDisplayName(user) {
  return user?.username || '';
}

function getUserInitial(user) {
  const source = getUserDisplayName(user) || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase() || 'U';
}

function IconUserLogin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8.2" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

// Este componente monta la interfaz comun compartida por todas las paginas.
function AppShell({ session, onLogout, onSessionChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get('search') || '';
  const isAuthenticated = Boolean(session?.token);
  const isAdmin = session?.user?.role === 'admin';
  const userRole = session?.user?.role;
  const canAccessFavorites = userRole === 'user' || isAdmin;
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    if (item.authenticatedOnly) {
      return isAuthenticated;
    }
    if (Array.isArray(item.allowedRoles) && item.allowedRoles.length > 0) {
      return isAuthenticated && (isAdmin || item.allowedRoles.includes(userRole));
    }
    return true;
  });

  // Cuando cambia la ruta se cierra el menu movil para mejorar la experiencia de uso.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!userMenuRef.current || userMenuRef.current.contains(event.target)) {
        return;
      }

      setIsUserMenuOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    onLogout();
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

          <Link to="/map" className="app-brand" aria-label="Ir al mapa de Eventos en Ames">
            <img className="app-brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
            <span className="app-brand-copy">
              <strong>Eventos en Ames</strong>
              <span>Agenda municipal y familiar</span>
            </span>
          </Link>

          <div className="app-search-wrap">
            <input
              type="text"
              placeholder="Buscar eventos, lugares o categorias..."
              className="app-search"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>

          <nav className="app-topbar-links" aria-label="Enlaces rapidos">
            <NavLink to="/events" className={({ isActive }) => `app-topbar-link${isActive ? ' active' : ''}`}>
              Agenda
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => `app-topbar-link${isActive ? ' active' : ''}`}>
              Mapa
            </NavLink>
          </nav>

          <div className="app-auth-wrap">
            {isAuthenticated ? (
              <div className="app-user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="app-user-avatar-btn"
                  aria-label="Abrir menu de usuario"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                >
                  {getUserInitial(session.user)}
                </button>

                {isUserMenuOpen && (
                  <div className="app-user-menu">
                    <div className="app-user-menu-header">
                      <strong>{getUserDisplayName(session.user) || 'Usuario'}</strong>
                      <span>{session.user?.email || ''}</span>
                    </div>
                    <Link to="/profile" className="app-user-menu-link" onClick={() => setIsUserMenuOpen(false)}>
                      Mi perfil
                    </Link>
                    {canAccessFavorites && (
                      <Link to="/favorites" className="app-user-menu-link" onClick={() => setIsUserMenuOpen(false)}>
                        Mis favoritos
                      </Link>
                    )}
                    <Link to="/alerts" className="app-user-menu-link" onClick={() => setIsUserMenuOpen(false)}>
                      Mis alertas
                    </Link>
                    <button type="button" className="app-user-menu-button" onClick={handleLogoutClick}>
                      Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="app-auth-link">
                <span className="app-auth-link-icon" aria-hidden="true"><IconUserLogin /></span>
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && <button type="button" className="app-menu-backdrop" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menu" />}

      <nav className={`app-drawer${isMenuOpen ? ' open' : ''}`}>
        <div className="app-drawer-brand">
          <img className="app-brand-mark" src="/favicon.svg" alt="" aria-hidden="true" />
          <h1 className="app-title">Eventos en Ames</h1>
        </div>
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

          <Route path="/events" element={<EventsPage session={session} />} />
          <Route
            path="/events/new"
            element={(
              <ProtectedRoute session={session} allowedRoles={['admin', 'content_manager']}>
                <EventCreatePage />
              </ProtectedRoute>
            )}
          />
          <Route path="/events/:id" element={<EventDetailPage session={session} />} />
          <Route
            path="/favorites"
            element={(
              <ProtectedRoute session={session} allowedRoles={['user', 'admin']}>
                <FavoritesPage session={session} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/alerts"
            element={(
              <ProtectedRoute session={session}>
                <AlertsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/events/:id/edit"
            element={(
              <ProtectedRoute session={session} allowedRoles={['admin', 'content_manager']}>
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
              <ProtectedRoute session={session} allowedRoles={['admin', 'content_manager']}>
                <OrganizersPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/categories"
            element={(
              <ProtectedRoute session={session} allowedRoles={['admin', 'content_manager']}>
                <CategoriesPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/locations"
            element={(
              <ProtectedRoute session={session} allowedRoles={['admin', 'content_manager']}>
                <LocationsPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <ProtectedRoute session={session} requireAdmin>
                <UsersPage session={session} />
              </ProtectedRoute>
            )}
          />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
          <Route path="/login" element={<LoginPage onLogin={onSessionChange} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute session={session}>
                <ProfilePage session={session} />
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<p className="app-not-found">Ruta no encontrada.</p>} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <div>
            <strong>Eventos en Ames</strong>
            <p>Proyecto TFG - Angel Varela - 2026</p>
          </div>
          <nav className="app-footer-links" aria-label="Enlaces del pie">
            <Link to="/events">Eventos</Link>
            <Link to="/map">Mapa</Link>
            {isAuthenticated && <Link to="/alerts">Alertas</Link>}
            {canAccessFavorites && <Link to="/favorites">Favoritos</Link>}
          </nav>
        </div>
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

  const syncSessionFromStorage = useCallback(() => {
    setSession(getAuthSession());
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_SESSION_EVENT, syncSessionFromStorage);
    window.addEventListener('storage', syncSessionFromStorage);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSessionFromStorage);
      window.removeEventListener('storage', syncSessionFromStorage);
    };
  }, [syncSessionFromStorage]);

  return (
    <BrowserRouter>
      <AppShell session={session} onLogout={handleLogout} onSessionChange={syncSessionFromStorage} />
    </BrowserRouter>
  );
}

// Se exporta el componente raiz consumido desde index.js.
export default App;
