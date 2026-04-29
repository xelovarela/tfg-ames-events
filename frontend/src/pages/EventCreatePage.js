/**
 * Este archivo define la página de creación de eventos.
 * Su responsabilidad es mostrar un contenedor sencillo alrededor del formulario
 * reutilizable que se usa para dar de alta nuevos eventos.
 */
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EventForm from '../EventForm';
import { API_BASE_URL } from '../config';
import { withAuthHeaders } from '../utils/authFetch';
import { readJsonResponse } from '../utils/http';

// Esta página envuelve el formulario de alta y ofrece un enlace de vuelta.
function EventCreatePage() {
  const [searchParams] = useSearchParams();
  const duplicateFrom = searchParams.get('duplicateFrom');
  const [duplicateSourceEvent, setDuplicateSourceEvent] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(duplicateFrom));

  useEffect(() => {
    let isMounted = true;

    const loadDuplicateSource = async () => {
      if (!duplicateFrom) {
        setDuplicateSourceEvent(null);
        setLoadError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/events/${duplicateFrom}`, {
          headers: withAuthHeaders()
        });
        const event = await readJsonResponse(response, 'No se pudo cargar el evento a duplicar.');
        if (isMounted) {
          setDuplicateSourceEvent(event);
          setLoadError('');
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setDuplicateSourceEvent(null);
          setLoadError(error.message || 'No se pudo cargar el evento a duplicar.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDuplicateSource();
    return () => {
      isMounted = false;
    };
  }, [duplicateFrom]);

  return (
    <main>
      <h2>{duplicateFrom ? 'Duplicar evento' : 'Crear evento'}</h2>

      <div className="event-detail-nav">
        <Link to="/events" className="app-inline-link">
          Volver a eventos
        </Link>
      </div>

      {loadError && <p className="event-filters-feedback event-filters-feedback-error">{loadError}</p>}
      {isLoading ? (
        <p className="event-filters-feedback">Cargando datos del evento...</p>
      ) : (
        <EventForm duplicateSourceEvent={duplicateSourceEvent} />
      )}
    </main>
  );
}

export default EventCreatePage;
