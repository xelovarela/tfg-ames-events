import React, { useState } from 'react';
import EventForm from '../EventForm';
import EventList from '../EventList';
import { API_BASE_URL } from '../config';

function EventsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [eventToEdit, setEventToEdit] = useState(null);

  const refreshAll = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleEditEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error loading event');
      }

      setEventToEdit(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar el evento');
    }
  };

  const handleEditFinished = () => {
    setEventToEdit(null);
    refreshAll();
  };

  return (
    <main>
      <h2>Gestion de Eventos</h2>

      <EventForm
        onEventCreated={refreshAll}
        eventToEdit={eventToEdit}
        onEditFinished={handleEditFinished}
      />

      <EventList
        refreshTrigger={refreshTrigger}
        onEditEvent={handleEditEvent}
      />
    </main>
  );
}

export default EventsPage;
