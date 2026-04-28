import React from 'react';
import { Accessibility, Keyboard, MessageSquareText, Type } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

function AccessibilityPage() {
  return (
    <StaticPageLayout
      eyebrow="Compromiso"
      title="Accesibilidad"
      subtitle="La interfaz de Ames Events se diseña para ser clara, responsive y comoda de usar con teclado, raton o pantalla tactil."
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
          facilitar la navegacion en distintos tamaños de pantalla.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={Keyboard} title="Navegacion por teclado">
        <ul className="static-page-bullets">
          <li>Los elementos interactivos pueden recorrerse con Tab y activarse con teclado.</li>
          <li>Los formularios usan etiquetas visibles para no depender solo de placeholders.</li>
          <li>Los estados de foco son perceptibles para seguir el recorrido de navegacion.</li>
        </ul>
      </StaticPageSection>

      <StaticPageSection icon={Type} title="Legibilidad">
        <p>
          Se priorizan tipografias claras, tamaño suficiente, bloques de texto breves y contraste adecuado para que la
          lectura sea comoda tanto en movil como en escritorio.
        </p>
      </StaticPageSection>

      <StaticPageSection icon={MessageSquareText} title="Contacto por accesibilidad">
        <p>
          Si detectas una barrera de uso o una pantalla poco accesible, escribe a admin@anxovarela.es indicando la pagina,
          el dispositivo utilizado y una breve descripcion del problema.
        </p>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default AccessibilityPage;
