/**
 * Este archivo define la pagina de creacion de eventos.
 * Su responsabilidad es mostrar un contenedor sencillo alrededor del formulario
 * reutilizable que se usa para dar de alta nuevos eventos.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import EventForm from '../EventForm';

// Esta pagina envuelve el formulario de alta y ofrece un enlace de vuelta.
function EventCreatePage() {
  return (
    <main>
      <h2>Crear evento</h2>

      <div className="event-detail-nav">
        <Link to="/events" className="app-inline-link">
          Volver a eventos
        </Link>
      </div>

      <EventForm />
    </main>
  );
}

export default EventCreatePage;