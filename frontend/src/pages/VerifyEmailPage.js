import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { readJsonResponse } from '../utils/http';
import './VerifyEmailPage.css';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando tu correo...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No se encontro token de verificación en la URL.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await readJsonResponse(response, 'No se pudo verificar el email.');

        setStatus('success');
        setMessage(data.message || 'Email verificado correctamente.');
      } catch (error) {
        console.error(error);
        setStatus('error');
        setMessage(error.message || 'No se pudo verificar el email.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main>
      <h2>Verificacion de correo</h2>

      <section className="verify-card">
        <p className={`verify-message${status === 'success' ? ' verify-message-success' : ''}`}>
          {message}
        </p>

        <div className="verify-actions">
          <Link to="/login" className="verify-link">
            Ir a iniciar sesión
          </Link>
          <Link to="/register" className="verify-link">
            Crear otra cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}

export default VerifyEmailPage;
