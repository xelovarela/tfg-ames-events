import React from 'react';
import { GraduationCap, Info, ShieldCheck, Users } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function AboutPage() {
  return (
    <StaticPageLayout
      eyebrow="Informacion general"
      title="Acerca de Ames Events"
      subtitle="Ames Events reune en un solo lugar la agenda municipal y familiar del concello, con una experiencia clara para familias, personas cuidadoras y ciudadania en general."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Enfoque</strong>
            <span>Eventos infantiles, familiares, culturales, deportivos y municipales.</span>
          </div>
          <div className="static-page-fact">
            <strong>Publico</strong>
            <span>Familias, cuidadores, entidades locales y cualquier persona que quiera planificar mejor su tiempo libre.</span>
          </div>
          <div className="static-page-fact">
            <strong>Proyecto</strong>
            <span>Trabajo de fin de grado de Angel Varela, 2026.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={Info} title="Que es Ames Events">
        <p>
          Es una agenda local pensada para consultar planes de forma comoda, encontrar actividades cercanas y volver a
          ellas sin perderse entre demasiadas pantallas.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Users} title="Que centraliza">
        <ul className="static-page-bullets">
          <li>Actividades infantiles y familiares.</li>
          <li>Propuestas culturales y deportivas.</li>
          <li>Eventos organizados o difundidos por el ambito municipal.</li>
          <li>Informacion util para decidir rapido que hacer hoy, este fin de semana o en proximas fechas.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={ShieldCheck} title="A quien ayuda">
        <p>
          La idea es reducir friccion: menos tiempo buscando, mas claridad para comparar eventos y una navegacion mas
          amable en movil y escritorio.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={GraduationCap} title="Por que existe">
        <p>
          El proyecto se ha desarrollado como trabajo academico para construir un flujo completo de agenda local:
          consulta, favoritos, alertas, mapa, gestion de eventos y paginas informativas basicas.
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default AboutPage;
