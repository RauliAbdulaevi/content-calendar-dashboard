import { useEffect, useState } from "react";
import { CheckCircle2, ImagePlus, Save, Trash2, UserRound, X } from "lucide-react";
import RoleBadge from "./RoleBadge.jsx";

export default function ProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ name: cleanName, avatarUrl });
      setSuccess("Profile updated.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function updateAvatar(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    if (file.size > 750000) {
      setError("Profile picture must be smaller than 750 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setSuccess("");
      setAvatarUrl(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop profile-backdrop" onMouseDown={handleBackdropClick} role="presentation">
      <form className="modal profile-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <span className="profile-modal-kicker">Account settings</span>
            <h2>Edit Profile</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close profile editor">
            <X size={16} />
          </button>
        </div>

        <div className="profile-hero">
          <span className="profile-modal-avatar">
            {avatarUrl ? <img src={avatarUrl} alt="" /> : <UserRound size={20} />}
          </span>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-photo-actions">
          <label className="secondary-button profile-upload-button">
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={updateAvatar} />
            <ImagePlus size={14} />
            {avatarUrl ? "Change photo" : "Upload photo"}
          </label>
          {avatarUrl && (
            <button type="button" className="secondary-button" onClick={() => setAvatarUrl("")}>
              <Trash2 size={13} />
              Remove photo
            </button>
          )}
        </div>

        <label>
          Name
          <input name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength="80" placeholder="Your display name" />
        </label>

        <div className="profile-readonly-grid">
          <label>
            Email
            <input value={user?.email || ""} readOnly />
          </label>
          <div className="profile-role-field">
            <span>Role</span>
            <RoleBadge role={user?.role} />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        {success && (
          <p className="form-success">
            <CheckCircle2 size={14} />
            {success}
          </p>
        )}

        <footer className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSaving}>
            <Save size={12} />
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </footer>
      </form>
    </div>
  );
}
