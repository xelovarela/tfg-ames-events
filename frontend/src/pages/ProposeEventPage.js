import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createContentManagerRequest,
  listMyContentManagerRequests
} from '../utils/contentManagerRequestsApi';
import './ProposeEventPage.css';

function formatDateTime(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function statusText(status) {
  if (status === 'approved') return 'Aprobada';
  if (status === 'rejected') return 'Rechazada';
  return 'Pendiente';
}

function ProposeEventPage({ session }) {
  const [requests, setRequests] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    organization_name: '',
    proposal_title: '',
    proposal_description: ''
  });

  const userRole = session?.user?.role || '';
  const alreadyManager = userRole === 'admin' || userRole === 'content_manager';

  const latestRequest = useMemo(() => (requests.length > 0 ? requests[0] : null), [requests]);
  const hasPendingRequest = latestRequest?.status === 'pending';

  const loadRequests = async () => {
    try {
      const data = await listMyContentManagerRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setRequests([]);
      setLoadError(error.message || 'No se pudieron cargar tus solicitudes.');
    }
  };

  useEffect(() => {
    if (alreadyManager) {
      return;
    }
    loadRequests();
  }, [alreadyManager]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || hasPendingRequest) {
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await createContentManagerRequest(formData);
      setMessage(response?.message || 'Solicitud enviada correctamente.');
      setFormData({
        phone: '',
        organization_name: '',
        proposal_title: '',
        proposal_description: ''
      });
      await loadRequests();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'No se pudo enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadyManager) {
    return (
      <main>
        <h2>Proponer evento</h2>
        <section className="proposal-card">
          <h3>Tu cuenta ya tiene permisos de gestion</h3>
          <p>Puedes crear un evento directamente desde el formulario de alta.</p>
          <Link to="/events/new" className="proposal-inline-link">Crear evento</Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <h2>Proponer evento vecinal</h2>

      <section className="proposal-card">
        <h3>Solicita acceso como gestor de contenido</h3>
        <p>
          Envia una propuesta con tus datos. Administracion revisara la solicitud y,
          si procede, activara tu cuenta como gestor para publicar eventos.
        </p>

        {loadError && <p className="proposal-message proposal-message-error">{loadError}</p>}
        {message && <p className="proposal-message">{message}</p>}

        {latestRequest && (
          <article className="proposal-latest-status">
            <h4>Estado de tu ultima solicitud</h4>
            <p>
              <strong>{statusText(latestRequest.status)}</strong>
              {' '}({formatDateTime(latestRequest.created_at)})
            </p>
            {latestRequest.admin_notes && <p>Notas de administracion: {latestRequest.admin_notes}</p>}
          </article>
        )}

        <form className="proposal-form" onSubmit={handleSubmit}>
          <label htmlFor="proposal-phone">Telefono de contacto (opcional)</label>
          <input
            id="proposal-phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            maxLength={30}
          />

          <label htmlFor="proposal-organization">Asociacion o entidad (opcional)</label>
          <input
            id="proposal-organization"
            name="organization_name"
            type="text"
            value={formData.organization_name}
            onChange={handleChange}
            maxLength={150}
          />

          <label htmlFor="proposal-title">Titulo de la propuesta</label>
          <input
            id="proposal-title"
            name="proposal_title"
            type="text"
            value={formData.proposal_title}
            onChange={handleChange}
            maxLength={150}
            required
          />

          <label htmlFor="proposal-description">Descripcion</label>
          <textarea
            id="proposal-description"
            name="proposal_description"
            value={formData.proposal_description}
            onChange={handleChange}
            rows={6}
            maxLength={2000}
            required
          />

          <button type="submit" disabled={isSubmitting || hasPendingRequest}>
            {isSubmitting ? 'Enviando...' : hasPendingRequest ? 'Solicitud pendiente' : 'Enviar solicitud'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProposeEventPage;
