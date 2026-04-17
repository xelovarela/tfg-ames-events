import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './PasswordResetPage.css';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!token) {
      setMessage('Token invalido o expirado.');
      setIsSuccess(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage('La contrasena debe tener al menos 8 caracteres.');
      setIsSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contrasenas no coinciden.');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Token invalido o expirado.');
      }

      setMessage(data.message || 'Contrasena actualizada.');
      setIsSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setMessage('Token invalido o expirado.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h2>Nueva contrasena</h2>

      <section className="password-reset-card">
        <form className="password-reset-form" onSubmit={handleSubmit}>
          <label htmlFor="new-password">Nueva contrasena</label>
          <input
            id="new-password"
            type="password"
            className="password-reset-input"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
          />

          <label htmlFor="confirm-new-password">Confirmar contrasena</label>
          <input
            id="confirm-new-password"
            type="password"
            className="password-reset-input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />

          <div className="password-reset-actions">
            <button className="password-reset-btn password-reset-btn-primary" type="submit" disabled={isSubmitting || isSuccess}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar contrasena'}
            </button>
            <Link to="/login" className="password-reset-link">
              Volver al login
            </Link>
          </div>
        </form>

        {message && (
          <p className={`password-reset-message${isSuccess ? ' password-reset-message-success' : ''}`}>
            {isSuccess ? 'Contrasena actualizada.' : message}
          </p>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
