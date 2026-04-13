import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EventForm from '../EventForm';
import { API_BASE_URL } from '../config';

function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventToEdit, setEventToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadEvent = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'No se pudo cargar el evento');
        }

        if (isMounted) {
          setEventToEdit(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (isMounted) {
          setEventToEdit(null);
          setError(loadError.message || 'No se pudo cargar el evento');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleEditFinished = () => {
    navigate('/events');
  };

  return (
    <main>
      <h2>Editar evento</h2>

      <div className="event-detail-nav">
        <Link to="/events" className="app-inline-link">Volver a eventos</Link>
        <span>·</span>
        <Link to={`/events/${id}`} className="app-inline-link">Ver detalle</Link>
      </div>

      {loading && <p>Cargando evento...</p>}

      {!loading && error && (
        <div className="event-detail-card">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && eventToEdit && (
        <EventForm
          eventToEdit={eventToEdit}
          onEditFinished={handleEditFinished}
        />
      )}
    </main>
  );
}

export default EventEditPage;