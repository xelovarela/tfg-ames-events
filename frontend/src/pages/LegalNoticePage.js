/**
 * Pagina de aviso legal.
 * Expone informacion responsable del sitio y condiciones generales de uso.
 */
import React from 'react';
import { FileText, Scale, ShieldCheck } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function LegalNoticePage() {
  return (
    <StaticPageLayout
      eyebrow="Legal"
      title="Aviso legal"
      subtitle="Informacion general sobre el sitio, su naturaleza academica y las condiciones de uso."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Titularidad</strong>
            <span>Manuel Angel Varela Martinez</span>
          </div>
          <div className="static-page-fact">
            <strong>Contacto legal</strong>
            <span>admin@anxovarela.es</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={FileText} title="Informacion general">
        <p>
          Ames Events es una plataforma informativa centrada en la agenda de Ames. El contenido, el diseño y las funciones
          visibles forman parte de un proyecto académico / TFG.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Scale} title="Condiciones de uso">
        <ul className="static-page-bullets">
          <li>El uso del sitio debe respetar la legislacion vigente y la convivencia digital habitual.</li>
          <li>No se debe usar la plataforma para publicar contenido ilícito, engañoso o que suplante identidades.</li>
          <li>La información publicada debe utilizarse respetando la finalidad informativa de la plataforma.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={ShieldCheck} title="Responsabilidad sobre contenidos">
        <p>
          La información mostrada puede depender de terceros o de aportaciones de usuarios. Conviene verificar horarios,
          ubicaciones y descripciones antes de tomar decisiones importantes.
        </p>
      </StaticPageSection>

      <StaticPageSection id="licencia" icon={FileText} title="Propiedad intelectual y enlaces externos">
        <p>
          Salvo que se indique lo contrario, los contenidos propios de Ames Events se publican bajo licencia Creative
          Commons Reconocimiento-NoComercial 4.0. Los nombres, marcas, imagenes y contenidos externos pertenecen a sus
          titulares. Los enlaces a sitios de terceros se ofrecen solo como referencia y cada web mantiene sus propias
          condiciones y politicas.
        </p>
        <div className="static-page-license" aria-label="Licencia Creative Commons BY-NC 4.0">
          <span className="static-page-license-mark">cc</span>
          <span className="static-page-license-icon">i</span>
          <span className="static-page-license-icon">nc</span>
          <strong>BY-NC 4.0</strong>
        </div>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default LegalNoticePage;
