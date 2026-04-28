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
            <span>La sesion autenticada se conserva en localStorage para mantener la experiencia tras recargar la pagina.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={UserRound} title="Que datos se tratan">
        <ul className="static-page-bullets">
          <li>Datos de cuenta y autenticacion, como nombre, correo y token de sesion.</li>
          <li>Favoritos guardados, alertas configuradas y acciones de uso dentro de la aplicacion.</li>
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
          La aplicacion aplica medidas tecnicas razonables para proteger el acceso y el almacenamiento.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={ShieldCheck} title="Derechos de las personas usuarias">
        <ul className="static-page-bullets">
          <li>Acceso a los datos tratados.</li>
          <li>Rectificacion y supresion cuando corresponda.</li>
          <li>Oposicion y limitacion del tratamiento.</li>
          <li>Portabilidad, cuando sea aplicable.</li>
        </ul>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default PrivacyPage;
