/**
 * Este archivo define la pagina de inicio de sesion.
 * Implementa un formulario basico para autenticar usuario contra la API,
 * persistir token/usuario en localStorage y navegar al mapa tras login.
 */
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getAuthSession, setAuthSession } from '../utils/authStorage';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingSession = getAuthSession();
  if (existingSession?.token) {
    return <Navigate to="/map" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!loginValue.trim() || !password) {
      setMessage('Debes indicar usuario o email y contraseña.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

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
        throw new Error(data?.error || 'No se pudo iniciar sesion.');
      }

      setAuthSession({
        token: data.token,
        user: data.user
      });

      if (onLogin) {
        onLogin();
      }

      navigate('/map', { replace: true });
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
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

          <label htmlFor="password">Contraseña</label>
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
            <Link to="/map" className="login-link">
              Volver al mapa
            </Link>
          </div>
        </form>

        {message && <p className="login-message">{message}</p>}
      </section>
    </main>
  );
}

export default LoginPage;
