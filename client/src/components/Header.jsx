import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import RoleBadge from "./RoleBadge.jsx";

export default function Header({ onNewContent, user, isAdmin, onLogout }) {
  return (
    <header className="header">
      <div className="header-copy">
        <span className="eyebrow">Social calendar command center</span>
        <h1>Rauli's Content Calendar</h1>
        <p>Plan posts, attach visuals, choose publish times, and track published results.</p>
      </div>
      <div className="hero-preview" aria-hidden="true">
        <div className="hero-preview-photo" />
        <div className="hero-preview-card">
          <span>Today</span>
          <strong>4 launches</strong>
        </div>
      </div>
      <div className="header-actions">
        {user && <span className="signed-in-user">{user.name}</span>}
        {user && <RoleBadge role={user.role} />}
        {isAdmin && <Link className="secondary-button nav-button" to="/admin">Admin Panel</Link>}
        <button className="primary-button" onClick={onNewContent}>
          <Plus size={14} />
          New Content
        </button>
        <button className="secondary-button" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
