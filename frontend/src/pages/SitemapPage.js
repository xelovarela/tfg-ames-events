import React from 'react';
import { Link } from 'react-router-dom';
import { Link2, MapPinned, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

const SITEMAP_GROUPS = [
  {
    title: 'Principal',
    icon: Sparkles,
    links: [
      { to: '/', label: 'Inicio' },
      { to: '/events', label: 'Agenda / Eventos' },
      { to: '/map', label: 'Mapa' }
    ]
  },
  {
    title: 'Cuenta',
    icon: MapPinned,
    links: [
      { to: '/favorites', label: 'Favoritos' },
      { to: '/alerts', label: 'Alertas' },
      { to: '/profile', label: 'Mi perfil' }
    ]
  },
  {
    title: 'Informacion',
    icon: MessageSquare,
    links: [
      { to: '/acerca-de', label: 'Acerca de' },
      { to: '/contacto', label: 'Contacto' },
      { to: '/ayuda', label: 'Ayuda' }
    ]
  },
  {
    title: 'Legal',
    icon: ShieldCheck,
    links: [
      { to: '/privacidad', label: 'Privacidad' },
      { to: '/aviso-legal', label: 'Aviso legal' },
      { to: '/accesibilidad', label: 'Accesibilidad' }
    ]
  }
];

function SitemapPage() {
  return (
    <StaticPageLayout
      eyebrow="Mapa del sitio"
      title="Mapa del sitio"
      subtitle="Una vista ordenada de las rutas principales para moverse con rapidez por la aplicacion."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Objetivo</strong>
            <span>Encontrar rapido la seccion que necesitas sin recorrer toda la navegacion.</span>
          </div>
          <div className="static-page-fact">
            <strong>Formato</strong>
            <span>Lista simple, pensada para consulta rapida en movil o escritorio.</span>
          </div>
        </div>
      )}
    >
      <StaticPageSection icon={Link2} title="Enlaces internos">
        <div className="static-page-link-grid">
          {SITEMAP_GROUPS.map((group) => {
            const Icon = group.icon;

            return (
              <div key={group.title} className="static-page-link-card">
                <h3>
                  <span className="static-page-section-head" style={{ marginBottom: 0 }}>
                    <span className="static-page-section-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span>{group.title}</span>
                  </span>
                </h3>
                <div className="static-page-link-list">
                  {group.links.map((link) => (
                    <Link key={link.to} to={link.to}>{link.label}</Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </StaticPageSection>
    </StaticPageLayout>
  );
}

export default SitemapPage;
