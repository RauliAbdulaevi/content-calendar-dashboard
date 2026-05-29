import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck2, Plus, Sparkles, TrendingUp } from "lucide-react";
import ProfileModal from "./ProfileModal.jsx";
import RoleBadge from "./RoleBadge.jsx";

export default function Header({ onNewContent, user, isAdmin, onLogout, onUpdateProfile }) {
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-copy">
          <span className="eyebrow">Social calendar command center</span>
          <h1>Rauli's Content Calendar</h1>
          <p>Plan posts, attach visuals, choose publish times, and track published results.</p>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="hero-preview-photo" />
          <div className="hero-preview-card">
            <span>Campaign pulse</span>
            <strong>4 launches</strong>
            <small>Creators, ads, and socials aligned</small>
          </div>
          <div className="hero-signal-row">
            <span><CalendarCheck2 size={13} /> 12 scheduled</span>
            <span><TrendingUp size={13} /> +18%</span>
            <span><Sparkles size={13} /> Ideas ready</span>
          </div>
        </div>
        <div className="header-actions">
          {user && (
            <button className="profile-pill" type="button" onClick={() => setProfileOpen(true)} aria-label="Edit profile">
              <span className="profile-avatar">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.name?.slice(0, 1) || "U"}
              </span>
              <span className="signed-in-user">{user.name}</span>
              <RoleBadge role={user.role} />
            </button>
          )}
          {isAdmin && <Link className="secondary-button nav-button" to="/admin">Admin Panel</Link>}
          <button className="primary-button" onClick={onNewContent}>
            <Plus size={14} />
            New Content
          </button>
          <button className="secondary-button" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {isProfileOpen && user && (
        <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSave={onUpdateProfile} />
      )}
    </>
  );
}
