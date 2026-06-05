/**
 * Pie de pagina comun de la aplicacion.
 * Reune enlaces legales, informacion de contacto y accesos secundarios.
 */
import React from 'react';
import { Link } from 'react-router-dom';

function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-brand">
          <strong>Eventos en Ames</strong>
          <p>Agenda local para descubrir eventos, espacios y actividades en Ames.</p>
          <span>Proyecto TFG - Angel Varela - 2026</span>
        </div>

        <nav className="app-footer-group" aria-label="Explorar">
          <span className="app-footer-group-title">Explorar</span>
          <div className="app-footer-group-links">
            <Link to="/">Inicio</Link>
            <Link to="/events">Agenda</Link>
            <Link to="/map">Mapa</Link>
            <Link to="/favorites">Favoritos</Link>
            <Link to="/alerts">Alertas</Link>
          </div>
        </nav>

        <nav className="app-footer-group" aria-label="Informacion">
          <span className="app-footer-group-title">Informacion</span>
          <div className="app-footer-group-links">
            <Link to="/acerca-de">Acerca de</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/ayuda">Ayuda</Link>
            <Link to="/accesibilidad">Accesibilidad</Link>
          </div>
        </nav>

        <nav className="app-footer-group" aria-label="Legal">
          <span className="app-footer-group-title">Legal</span>
          <div className="app-footer-group-links">
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/aviso-legal">Aviso legal</Link>
            <Link to="/mapa-del-sitio">Mapa del sitio</Link>
          </div>
        </nav>
      </div>

      <div className="app-footer-bottom">
        <span>&copy; 2026 Eventos en Ames. Proyecto académico TFG de Angel Varela.</span>
        <span>Esta web no utiliza cookies.</span>
        <Link to="/aviso-legal#licencia">Licencia Creative Commons BY-NC 4.0</Link>
      </div>
    </footer>
  );
}

export default AppFooter;
