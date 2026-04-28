import React from 'react';
import './StaticPageLayout.css';

function StaticPageLayout({ eyebrow, title, subtitle, note, children, aside, className = '' }) {
  return (
    <div className={`static-page${className ? ` ${className}` : ''}`}>
      <header className="static-page-hero">
        {eyebrow && <p className="static-page-kicker">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="static-page-subtitle">{subtitle}</p>}
        {note && <p className="static-page-note">{note}</p>}
      </header>

      <div className={`static-page-grid${aside ? ' static-page-grid-with-aside' : ''}`}>
        <div className="static-page-content">
          {children}
        </div>

        {aside && (
          <aside className="static-page-aside">
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}

export function StaticPageSection({ icon: Icon, title, children, className = '', id }) {
  return (
    <section id={id} className={`static-page-section${className ? ` ${className}` : ''}`}>
      <div className="static-page-section-head">
        {Icon && (
          <span className="static-page-section-icon" aria-hidden="true">
            <Icon />
          </span>
        )}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default StaticPageLayout;
