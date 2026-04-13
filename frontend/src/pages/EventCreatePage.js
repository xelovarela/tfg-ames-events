import React from 'react';
import { Link } from 'react-router-dom';
import EventForm from '../EventForm';

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