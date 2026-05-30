/**
 * Mapa del sitio.
 * Agrupa enlaces principales, paginas legales y accesos de administracion.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Link2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import StaticPageLayout, { StaticPageSection } from './StaticPageLayout';

const SITEMAP_GROUPS = [
  {
    title: 'Principal',
    icon: Sparkles,
    links: [
      { to: '/', label: 'Inicio' },
      { to: '/events', label: 'Listado de eventos' },
      { to: '/events/calendar', label: 'Calendario' },
      { to: '/map', label: 'Mapa' }
    ]
  },
  {
    title: 'Acceso',
    icon: LockKeyhole,
    links: [
      { to: '/login', label: 'Iniciar sesion' },
      { to: '/register', label: 'Registro' },
      { to: '/forgot-password', label: 'Recuperar contrasena' }
    ]
  },
  {
    title: 'Informacion',
    icon: CalendarDays,
    links: [
      { to: '/acerca-de', label: 'Acerca de' },
      { to: '/contacto', label: 'Contacto' },
      { to: '/ayuda', label: 'Ayuda' },
      { to: '/mapa-del-sitio', label: 'Mapa del sitio' }
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
      subtitle="Una vista ordenada de las rutas principales para moverse con rapidez por la aplicación."
      aside={(
        <div className="static-page-facts">
          <div className="static-page-fact">
            <strong>Objetivo</strong>
            <span>Encontrar rapido la sección que necesitas sin recorrer toda la navegación.</span>
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
