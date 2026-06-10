/**
 * Página de ayuda.
 * Reúne preguntas frecuentes y consejos de uso para búsqueda, favoritos y alertas.
 */
import React from 'react';
import { BellRing, CalendarDays, CircleHelp, Copy, Filter, Heart, MapPinned, Search, TriangleAlert } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

const FAQ_ITEMS = [
  {
    icon: Search,
    question: 'Como busco eventos?',
    answer: 'Entra en la agenda y usa el buscador del panel de filtros. Puedes buscar por título, lugar o descripción.'
  },
  {
    icon: Filter,
    question: 'Como uso los filtros?',
    answer: 'Puedes combinar búsqueda, fecha, gratuito, categoría, ubicación y audiencia. Los filtros activos aparecen como chips y se pueden quitar uno a uno.'
  },
  {
    icon: MapPinned,
    question: 'Como veo los eventos en mapa?',
    answer: 'Abre la vista de mapa desde la navegación principal o el footer. Los marcadores agrupan eventos por ubicación y comparten los mismos filtros que el listado.'
  },
  {
    icon: CalendarDays,
    question: 'Como uso el calendario?',
    answer: 'La vista de calendario muestra los eventos por día. Si eres gestor, también puedes alternar entre eventos futuros, pasados o todos.'
  },
  {
    icon: Heart,
    question: 'Como guardo favoritos?',
    answer: 'Inicia sesión y pulsa el icono de favorito desde el listado o el detalle. Después puedes revisarlos en Mis favoritos.'
  },
  {
    icon: BellRing,
    question: 'Como funcionan las alertas?',
    answer: 'Las alertas permiten recibir avisos cuando se crean eventos que encajan con tus criterios: categoría, ubicación, audiencia o palabra clave.'
  },
  {
    icon: Copy,
    question: 'Puedo duplicar eventos?',
    answer: 'Si eres admin o gestor de contenidos, puedes duplicar eventos pasados o futuros desde el listado o el detalle. El duplicado exige elegir una nueva fecha.'
  },
  {
    icon: TriangleAlert,
    question: 'Qué hago si falta información?',
    answer: 'Consulta el detalle del evento o escribe a admin@anxovarela.es para comunicar la corrección. Si tienes cuenta, también puedes solicitar acceso para proponer eventos.'
  }
];

function HelpPage() {
  return (
    <StaticPageLayout
      eyebrow="Ayuda"
      title="Preguntas frecuentes"
      subtitle="Una guia rapida para moverte por Ames Events sin perder tiempo."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Atajo rápido</strong>
            <span>La home, la agenda, el calendario y el mapa estan a un clic en la cabecera o en el footer.</span>
          </div>
          <div className="static-page-fact">
            <strong>Si algo no cuadra</strong>
            <span>Comprueba si tienes filtros activos o si estas viendo solo eventos futuros, pasados o todos.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={CircleHelp} title="Resolvemos lo basico">
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
