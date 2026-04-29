/**
 * Este archivo define el contenedor principal del frontend.
 * Configura el enrutado de React Router y la distribucion general de la
 * aplicación de Eventos en Ames.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { AUTH_SESSION_EVENT, clearAuthSession, getAuthSession } from './utils/authStorage';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import AppRoutes from './AppRoutes';

const PUBLIC_URL = process.env.PUBLIC_URL || '';

function getRouterBasename() {
  if (!PUBLIC_URL) {
    return undefined;
  }

  try {
    const resolvedUrl = typeof window === 'undefined'
      ? new URL(PUBLIC_URL, 'http://localhost')
      : new URL(PUBLIC_URL, window.location.origin);
    const pathname = resolvedUrl.pathname.replace(/\/+$/, '');
    return pathname || undefined;
  } catch (error) {
    const normalized = PUBLIC_URL.startsWith('/')
      ? PUBLIC_URL.replace(/\/+$/, '')
      : '';
    return normalized || undefined;
  }
}

function AppShell({ session, onLogout, onSessionChange }) {
  return (
    <div className="app-container">
      <AppHeader session={session} onLogout={onLogout} />

      <main className="app-main">
        <AppRoutes session={session} onSessionChange={onSessionChange} />
      </main>

      <AppFooter />
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => getAuthSession());
  const routerBasename = getRouterBasename();

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
    <BrowserRouter basename={routerBasename}>
      <AppShell session={session} onLogout={handleLogout} onSessionChange={syncSessionFromStorage} />
    </BrowserRouter>
  );
}

export default App;
