import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './PasswordResetPage.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo solicitar la recuperacion.');
      }

      setMessage(data.message || 'Si el email existe, recibiras instrucciones para restablecer la contrasena.');
      setEmail('');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo solicitar la recuperacion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h2>Recuperar contrasena</h2>

      <section className="password-reset-card">
        <form className="password-reset-form" onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            className="password-reset-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <div className="password-reset-actions">
            <button className="password-reset-btn password-reset-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
            <Link to="/login" className="password-reset-link">
              Volver al login
            </Link>
          </div>
        </form>

        {message && <p className="password-reset-message password-reset-message-success">{message}</p>}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
