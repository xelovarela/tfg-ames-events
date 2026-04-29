import React from 'react';
import { Database, Lock, ShieldCheck, UserRound } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function PrivacyPage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Politica de privacidad"
      subtitle="Informacion sobre el tratamiento de datos asociado al uso de Ames Events."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Datos tratados</strong>
            <span>Nombre, email, cuenta de usuario, favoritos, alertas y mensajes enviados por canales de contacto.</span>
          </div>
          <div className="static-page-fact">
            <strong>Base tecnica</strong>
            <span>La sesión autenticada se conserva en localStorage para mantener la experiencia tras recargar la página.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={UserRound} title="Que datos se tratan">
        <ul className="static-page-bullets">
          <li>Datos de cuenta y autenticación, como nombre, correo y token de sesión.</li>
          <li>Favoritos guardados, alertas configuradas y acciones de uso dentro de la aplicación.</li>
          <li>Datos enviados mediante canales de contacto o propuestas.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={Database} title="Finalidad del tratamiento">
        <p>
          Los datos se utilizan para gestionar el acceso, recordar preferencias, mostrar favoritos, activar alertas y
          atender mensajes de contacto o soporte.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Lock} title="Conservacion y seguridad">
        <p>
          Los datos se conservan mientras la cuenta siga activa o mientras sean necesarios para prestar el servicio.
          La aplicación aplica medidas técnicas razonables para proteger el acceso y el almacenamiento.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={ShieldCheck} title="Derechos de las personas usuarias">
        <ul className="static-page-bullets">
          <li>Acceso a los datos tratados.</li>
          <li>Rectificacion y supresion cuándo corresponda.</li>
          <li>Oposicion y limitacion del tratamiento.</li>
          <li>Portabilidad, cuándo sea aplicable.</li>
        </ul>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default PrivacyPage;
