import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLinkText }) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-photo-card">
            <span className="photo-chip">Campaign planning</span>
            <strong>28 posts</strong>
            <p>scheduled across five channels</p>
          </div>
          <div className="auth-visual-card">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="auth-card">
          <div className="auth-heading">
            <span className="eyebrow">Content Studio</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          <p className="auth-footer">
            {footerText} <Link to={footerLink}>{footerLinkText}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
