/**
 * Este archivo es la puerta de entrada del frontend React.
 * Crea la raiz de renderizado, monta el componente principal y deja preparado
 * el gancho opcional para medir métricas de rendimiento.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Se crea la raiz de React sobre el nodo HTML principal definido en public/index.html.
const root = ReactDOM.createRoot(document.getElementById('root'));
// StrictMode ayuda a detectar patrones inseguros durante el desarrollo.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Para medir rendimiento se puede pasar una funcion, por ejemplo reportWebVitals(console.log).
// La medicion queda disponible aunque no se este usando activamente.
reportWebVitals();
