import React from 'react';
import './App.css';
import AmesMap from './AmesMap';

function App() {
  return (
    <div className="app-container">
      {/* 1. Header más fino */}
      <header className="app-header">
        <h1>Ames Events</h1>
      </header>

      {/* 2. Barra de Menú/Usuario (estilo App móvil) */}
      <nav className="app-toolbar">
        <div className="icon-btn">☰</div> {/* Icono de Menú */}
        <div className="search-placeholder">Search events...</div>
        <div className="icon-btn">👤</div> {/* Icono de Usuario */}
      </nav>

      {/* 3. Contenedor del Mapa */}
      <main className="app-main">
        <AmesMap />
      </main>

      {/* 4. Footer pequeño */}
      <footer className="app-footer">
        <p>Angel Varela - 2026</p>
      </footer>
    </div>
  );
}

export default App;