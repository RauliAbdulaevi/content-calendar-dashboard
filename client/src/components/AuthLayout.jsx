import { Link } from "react-router-dom";

const visualContent = {
  login: {
    chip: "Campaign planning",
    value: "28 posts",
    detail: "scheduled across five channels"
  },
  register: {
    chip: "New workspace",
    value: "Launch",
    detail: "your first content calendar"
  }
};

export default function AuthLayout({ title, subtitle, children, footerText, footerLink, footerLinkText, variant = "login" }) {
  const visual = visualContent[variant] || visualContent.login;

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className={`auth-visual ${variant}`} aria-hidden="true">
          <div className="auth-photo-card">
            <span className="photo-chip">{visual.chip}</span>
            <strong>{visual.value}</strong>
            <p>{visual.detail}</p>
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
