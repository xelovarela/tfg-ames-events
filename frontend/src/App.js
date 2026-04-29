/**
 * Este archivo define el contenedor principal del frontend.
 * Configura el enrutado de React Router y la distribucion general de la
 * aplicacion de Eventos en Ames.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import MapPage from './pages/MapPage';
import EventsPage from './pages/EventsPage';
import AudiencesPage from './pages/AudiencesPage';
import OrganizersPage from './pages/OrganizersPage';
import EventDetailPage from './pages/EventDetailPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CategoriesPage from './pages/CategoriesPage';
import LocationsPage from './pages/LocationsPage';
import EventCreatePage from './pages/EventCreatePage';
import EventEditPage from './pages/EventEditPage';
import LegalNoticePage from './pages/LegalNoticePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PrivacyPage from './pages/PrivacyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import ProposeEventPage from './pages/ProposeEventPage';
import FavoritesPage from './pages/FavoritesPage';
import AccessibilityPage from './pages/AccessibilityPage';
import SitemapPage from './pages/SitemapPage';
import AlertsPage from './pages/AlertsPage';
import { AUTH_SESSION_EVENT, clearAuthSession, getAuthSession } from './utils/authStorage';
import ProtectedRoute from './ProtectedRoute';
import UsersPage from './pages/UsersPage';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

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
        <Routes>
          <Route path="/" element={<HomePage session={session} />} />

          <Route path="/map" element={<MapPage />} />
          <Route path="/acerca-de" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/aviso-legal" element={<LegalNoticePage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/accesibilidad" element={<AccessibilityPage />} />
          <Route path="/ayuda" element={<HelpPage />} />
          <Route path="/mapa-del-sitio" element={<SitemapPage />} />

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
          <Route
            path="/propose-event"
            element={(
              <ProtectedRoute session={session}>
                <ProposeEventPage session={session} />
              </ProtectedRoute>
            )}
          />

          <Route path="*" element={<p className="app-not-found">Ruta no encontrada.</p>} />
        </Routes>
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
