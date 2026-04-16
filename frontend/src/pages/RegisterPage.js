import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import './RegisterPage.css';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setMessage('Debes introducir un email valido.');
      return;
    }

    if (password.length < 8) {
      setMessage('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Las contrasenas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo registrar la cuenta.');
      }

      setMessage(data.message || 'Tu cuenta ha sido creada. Revisa tu correo para verificarla.');
      setIsSuccess(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo registrar la cuenta.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h2>Crear cuenta</h2>

      <section className="register-card">
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            className="register-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={50}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="register-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            type="password"
            className="register-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />

          <label htmlFor="confirm-password">Confirmar contrasena</label>
          <input
            id="confirm-password"
            type="password"
            className="register-input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
          />

          <div className="register-actions">
            <button className="register-btn register-btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrarme'}
            </button>
            <Link to="/login" className="register-link">
              Ya tengo cuenta
            </Link>
          </div>
        </form>

        {message && (
          <p className={`register-message${isSuccess ? ' register-message-success' : ''}`}>
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default RegisterPage;
