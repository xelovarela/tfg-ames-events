/**
 * Pagina de accesibilidad.
 * Resume criterios de uso inclusivo, navegacion con teclado y canales de ayuda.
 */
import React from 'react';
import { Accessibility, Keyboard, MessageSquareText, Type } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function AccessibilityPage() {
  return (
    <StaticPageLayout
      eyebrow="Compromiso"
      title="Accesibilidad"
      subtitle="La interfaz de Ames Events se diseña para ser clara, responsive y cómoda de usar con teclado, ratón o pantalla tactil."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Prioridades</strong>
            <span>Buen contraste, etiquetas visibles, textos legibles y rutas comprensibles.</span>
          </div>
          <div className="static-page-fact">
            <strong>Incidencias</strong>
            <span>admin@anxovarela.es</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={Accessibility} title="Compromiso de diseño">
        <p>
          La interfaz mantiene jerarquia visual clara, espaciado suficiente y componentes faciles de reconocer para
          facilitar la navegación en distintos tamaños de pantalla.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Keyboard} title="Navegacion por teclado">
        <ul className="static-page-bullets">
          <li>Los elementos interactivos pueden recorrerse con Tab y activarse con teclado.</li>
          <li>Los formularios usan etiquetas visibles para no depender solo de placeholders.</li>
          <li>Los estados de foco son perceptibles para seguir el recorrido de navegación.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={Type} title="Legibilidad">
        <p>
          Se priorizan tipografías claras, tamaño suficiente, bloques de texto breves y contraste adecuado para que la
          lectura sea cómoda tanto en movil como en escritorio.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={MessageSquareText} title="Contacto por accesibilidad">
        <p>
          Si detectas una barrera de uso o una pantalla poco accesible, escribe a admin@anxovarela.es indicando la página,
          el dispositivo utilizado y una breve descripción del problema.
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default AccessibilityPage;
