/**
 * Este archivo define la pagina de inicio de sesion.
 * Implementa un formulario basico para autenticar usuario contra la API,
 * persistir token/usuario en localStorage y navegar al mapa tras login.
 */
import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getAuthSession, setAuthSession } from '../utils/authStorage';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const fromPathname = location.state?.from?.pathname;
  const fromSearch = location.state?.from?.search || '';
  const fromHash = location.state?.from?.hash || '';
  const redirectTarget = (typeof fromPathname === 'string' && fromPathname.startsWith('/'))
    ? `${fromPathname}${fromSearch}${fromHash}`
    : '/';

  const existingSession = getAuthSession();
  if (existingSession?.token) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!loginValue.trim() || !password) {
      setMessage('Debes indicar usuario o email y contrasena.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setResendMessage('');
    setShowResend(false);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          login: loginValue.trim(),
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const apiError = data?.error || 'No se pudo iniciar sesion.';
        setShowResend(apiError.toLowerCase().includes('verificar'));
        throw new Error(apiError);
      }

      setAuthSession({
        token: data.token,
        user: data.user
      });

      if (onLogin) {
        onLogin();
      }

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending) {
      return;
    }

    const loginAsEmail = loginValue.trim();
    if (!loginAsEmail.includes('@')) {
      setResendMessage('Para reenviar la verificacion, inicia sesion usando tu email en lugar de usuario.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: loginAsEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo reenviar la verificacion.');
      }

      setResendMessage(data.message || 'Si la cuenta existe, hemos reenviado el correo.');
    } catch (error) {
      console.error(error);
      setResendMessage(error.message || 'No se pudo reenviar la verificacion.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main>
      <h2>Iniciar sesion</h2>

      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login">Usuario o email</label>
          <input
            id="login"
            type="text"
            className="login-input"
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            autoComplete="username"
          />

          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />

          <div className="login-actions">
            <button className="login-btn login-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Accediendo...' : 'Entrar'}
            </button>
            <Link to="/register" className="login-link">
              Crear cuenta
            </Link>
            <Link to="/forgot-password" className="login-link">
              Olvidaste tu contrasena?
            </Link>
            <Link to="/map" className="login-link">
              Volver al mapa
            </Link>
          </div>
        </form>

        {message && <p className="login-message">{message}</p>}

        {showResend && (
          <div className="login-resend">
            <p className="login-resend-info">
              Reenviaremos la verificacion al mismo email que has usado para iniciar sesion.
            </p>
            <button
              className="login-btn login-btn-secondary"
              type="button"
              disabled={isResending}
              onClick={handleResendVerification}
            >
              {isResending ? 'Enviando...' : 'Reenviar verificacion'}
            </button>
            {resendMessage && <p className="login-message">{resendMessage}</p>}
          </div>
        )}
      </section>
    </main>
  );
}

export default LoginPage;
