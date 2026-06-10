/**
 * Declaracion central de rutas del frontend.
 * Conecta cada URL con su página y aplica protección según rol cuando procede.
 */
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MapPage from './pages/MapPage';
import EventsPage from './pages/EventsPage';
import EventCalendarPage from './pages/EventCalendarPage';
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
import ProtectedRoute from './ProtectedRoute';
import UsersPage from './pages/UsersPage';

function AppRoutes({ session, onSessionChange }) {
  return (
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
      <Route path="/events/calendar" element={<EventCalendarPage session={session} />} />
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
          <ProtectedRoute session={session}>
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
  );
}

export default AppRoutes;
