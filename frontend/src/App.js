import React, { useState } from 'react';
import './App.css';
import AmesMap from './AmesMap';
import EventForm from './EventForm';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEventCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ames Events</h1>
      </header>

      <nav className="app-toolbar">
        <div className="icon-btn">☰</div>
        <div className="search-placeholder">Search events...</div>
        <div className="icon-btn">👤</div>
      </nav>

      <main className="app-main">
        <EventForm onEventCreated={handleEventCreated} />
        <AmesMap refreshTrigger={refreshTrigger} />
      </main>

      <footer className="app-footer">
        <p>Angel Varela - 2026</p>
      </footer>
    </div>
  );
}

export default App;