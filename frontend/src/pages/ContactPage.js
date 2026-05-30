/**
 * Pagina de contacto.
 * Muestra vias de comunicacion para consultas, incidencias y propuestas.
 */
import React from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function ContactPage() {
  return (
    <StaticPageLayout
      eyebrow="Contacto"
      title="Contacta con Ames Events"
      subtitle="Utiliza el correo de contacto para comunicar incidencias, sugerencias o consultas relacionadas con la agenda."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Correo de contacto</strong>
            <span>admin@anxovarela.es</span>
          </div>
          <div className="static-page-fact">
            <strong>Titular</strong>
            <span>Manuel Angel Varela Martinez</span>
          </div>
          <div className="static-page-fact">
            <strong>Proyecto</strong>
            <span>Trabajo de fin de grado, 2026.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={MessageSquare} title="Canal principal">
        <p>
          Para contactar con Ames Events, escribe a{' '}
          <a className="app-inline-link" href="mailto:admin@anxovarela.es">admin@anxovarela.es</a>.
          Incluye un asunto claro y toda la información necesaria para identificar el evento, la pantalla o la consulta.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Mail} title="Que puedes enviar">
        <ul className="static-page-bullets">
          <li>Sugerencias de mejora sobre la plataforma.</li>
          <li>Correcciones de información visible en la agenda.</li>
          <li>Propuestas de eventos o contenidos a publicar.</li>
          <li>Incidencias técnicas o de uso de la interfaz.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={Phone} title="Datos utiles">
        <p>
          Si escribes sobre un evento concreto, indica su título, fecha, ubicación y el cambio que quieres comunicar.
          Para incidencias técnicas, incluye el navegador, el dispositivo y una breve descripción de los pasos realizados.
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default ContactPage;
