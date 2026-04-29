import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, LogOut, MapPin, Search, UserRound } from 'lucide-react';
import { Link, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import './styles/topbar.css';

const PUBLIC_URL = process.env.PUBLIC_URL || '';

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

function AppHeader({ session, onLogout }) {
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
    <>
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

          <Link to="/" className="app-brand" aria-label="Ir a inicio de Eventos en Ames">
            <img className="app-brand-mark" src={`${PUBLIC_URL}/favicon.svg`} alt="" aria-hidden="true" />
            <span className="app-brand-copy">
              <strong>Eventos en Ames</strong>
              <span>Agenda municipal y familiar</span>
            </span>
          </Link>

          <div className="app-search-wrap">
            <span className="app-search-icon" aria-hidden="true">
              <Search />
            </span>
            <input
              type="text"
              placeholder="Buscar eventos, lugares o categorÃ­as..."
              className="app-search"
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>

          <nav className="app-topbar-links" aria-label="Enlaces rapidos">
            <NavLink to="/events" className={({ isActive }) => `app-topbar-link${isActive ? ' active' : ''}`}>
              <span className="app-topbar-link-icon" aria-hidden="true"><CalendarDays /></span>
              <span>Agenda</span>
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => `app-topbar-link${isActive ? ' active' : ''}`}>
              <span className="app-topbar-link-icon" aria-hidden="true"><MapPin /></span>
              <span>Mapa</span>
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
                  <span className="app-user-avatar-initial">{getUserInitial(session.user)}</span>
                  <span className="app-user-avatar-chevron" aria-hidden="true"><ChevronDown /></span>
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
                      <span className="app-user-menu-item-icon" aria-hidden="true"><LogOut /></span>
                      Cerrar sesion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="app-auth-link">
                <span className="app-auth-link-icon" aria-hidden="true"><UserRound /></span>
                Iniciar sesion
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && <button type="button" className="app-menu-backdrop" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menu" />}

      <nav className={`app-drawer${isMenuOpen ? ' open' : ''}`}>
        <div className="app-drawer-brand">
          <img className="app-brand-mark" src={`${PUBLIC_URL}/favicon.svg`} alt="" aria-hidden="true" />
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
    </>
  );
}

export default AppHeader;
