import React from 'react';
import { BellRing, CircleHelp, Filter, Heart, MapPinned, Search, TriangleAlert } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

const FAQ_ITEMS = [
  {
    icon: Search,
    question: '¿Cómo busco eventos?',
    answer: 'Usa la barra principal de búsqueda y entra en la agenda para ver el listado completo con resultados ordenados y filtrables.'
  },
  {
    icon: Filter,
    question: '¿Cómo uso los filtros?',
    answer: 'En la agenda puedes combinar filtros por categoría, ubicación, audiencia o rango temporal para reducir el listado a lo que te interesa.'
  },
  {
    icon: MapPinned,
    question: '¿Cómo veo los eventos en mapa?',
    answer: 'Abre la vista de mapa desde la navegación principal o el footer y toca sobre cada marcador para ver eventos agrupados por ubicación.'
  },
  {
    icon: Heart,
    question: '¿Cómo guardo favoritos?',
    answer: 'Entra en el detalle o en la agenda y pulsa el icono de favorito. Si tu cuenta lo permite, esos eventos quedarán guardados en tu perfil.'
  },
  {
    icon: BellRing,
    question: '¿Cómo funcionan las alertas?',
    answer: 'Las alertas permiten recibir avisos cuándo aparezcan eventos que encajen con tus criterios guardados, si la funcionalidad está activa para tu cuenta.'
  },
  {
    icon: TriangleAlert,
    question: '¿Qué hago si falta información?',
    answer: 'Consulta el detalle del evento, comprueba si existe un enlace externo o escribe a admin@anxovarela.es para comunicar la correccion.'
  }
];

function HelpPage() {
  return (
    <StaticPageLayout
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      subtitle="Una guía rápida para moverte por Ames Events sin perder tiempo."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Atajo rápido</strong>
            <span>La home, la agenda y el mapa están a un clic en la cabecera y en el footer.</span>
          </div>
          <div className="static-page-fact">
            <strong>Si algo no cuadra</strong>
            <span>Comprueba si estás viendo la versión filtrada del listado o el detalle de un evento concreto.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={CircleHelp} title="Resolvemos lo básico">
        <div className="static-page-faq-list">
          {FAQ_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <details key={item.question} className="static-page-faq">
                <summary>
                  <span className="static-page-section-head" style={{ marginBottom: 0 }}>
                    <span className="static-page-section-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span>{item.question}</span>
                  </span>
                </summary>
                <p>{item.answer}</p>
              </details>
            );
          })}
        </div>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default HelpPage;
