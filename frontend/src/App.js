import React, { useState } from 'react';
import './App.css';
import AmesMap from './AmesMap';
import EventForm from './EventForm';
import EventList from './EventList';
import LocationManager from './LocationManager';
import CategoryManager from './CategoryManager';
import { API_BASE_URL } from './config';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [locationsRefreshTrigger, setLocationsRefreshTrigger] = useState(0);
  const [categoriesRefreshTrigger, setCategoriesRefreshTrigger] = useState(0);

  const refreshAll = () => {
    setRefreshTrigger(prev => prev + 1);
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
  };

  const handleLocationsChanged = () => {
    setLocationsRefreshTrigger((prev) => prev + 1);
    refreshAll();
  };

  const handleCategoriesChanged = () => {
    setCategoriesRefreshTrigger((prev) => prev + 1);
    refreshAll();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ames Events</h1>
      </header>

      <nav className="app-toolbar">
        <div className="icon-btn">☰</div>
        <div className="search-placeholder">Buscar eventos...</div>
        <div className="icon-btn">👤</div>
      </nav>

      <main className="app-main">
        <EventForm
          onEventCreated={refreshAll}
          eventToEdit={eventToEdit}
          onEditFinished={handleEditFinished}
          locationRefreshTrigger={locationsRefreshTrigger}
          categoryRefreshTrigger={categoriesRefreshTrigger}
        />

        <CategoryManager onCategoriesChanged={handleCategoriesChanged} />

        <LocationManager onLocationsChanged={handleLocationsChanged} />

        <EventList
          refreshTrigger={refreshTrigger}
          onEditEvent={handleEditEvent}
        />

        <AmesMap refreshTrigger={refreshTrigger} />
      </main>

      <footer className="app-footer">
        <p>Angel Varela - 2026</p>
      </footer>
    </div>
  );
}

export default App;
