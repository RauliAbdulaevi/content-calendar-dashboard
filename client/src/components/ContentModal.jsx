import { useState } from "react";
import { Image as ImageIcon, Send } from "lucide-react";
import { contentTypes, defaultContentForm, platforms, statuses } from "../constants/content.js";
import { buildContentPayload } from "../utils/content.js";
import SelectField from "./SelectField.jsx";

function getInitialForm(idea, selectedDate) {
  if (!idea) {
    return {
      ...defaultContentForm,
      scheduledDate: selectedDate || defaultContentForm.scheduledDate
    };
  }

  return {
    title: idea.title || "",
    platform: idea.platform || "",
    contentType: idea.contentType || "",
    script: idea.script || "",
    caption: idea.caption || "",
    scheduledDate: idea.scheduledDate || selectedDate || defaultContentForm.scheduledDate,
    scheduledTime: idea.scheduledTime || defaultContentForm.scheduledTime,
    imageUrl: idea.imageUrl || "",
    status: idea.status || "Draft",
    impressions: idea.stats?.impressions || 0,
    likes: idea.stats?.likes || 0,
    comments: idea.stats?.comments || 0,
    shares: idea.stats?.shares || 0
  };
}

export default function ContentModal({ idea, onClose, onCreate, onUpdate, selectedDate }) {
  const isEditing = Boolean(idea);
  const [form, setForm] = useState(() => getInitialForm(idea, selectedDate));
  const [error, setError] = useState("");
  const [isSaving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function updateImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((currentForm) => ({ ...currentForm, imageUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = buildContentPayload(new FormData(event.currentTarget), form.imageUrl);

    if (!payload.title || !payload.scheduledDate || !payload.scheduledTime) {
      setError("Add a title, date, and time before saving this post.");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await onUpdate(idea.id, payload);
      } else {
        await onCreate(payload);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{isEditing ? "Edit Content Idea" : "New Content Idea"}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>

        <label>
          Title / Idea
          <input name="title" value={form.title} onChange={updateField} placeholder="Give your content idea a title..." />
        </label>

        <div className="field-grid">
          <SelectField label="Platform" name="platform" value={form.platform} onChange={updateField} options={platforms} placeholder="Select platform" />
          <SelectField label="Content Type" name="contentType" value={form.contentType} onChange={updateField} options={contentTypes} placeholder="Select type" />
        </div>

        <label>
          Post / Content Ideas
          <textarea name="script" value={form.script} onChange={updateField} placeholder="Write your post, bullet points, or content ideas here..." />
        </label>

        <label>
          Caption
          <textarea name="caption" value={form.caption} onChange={updateField} placeholder="Write your caption here..." />
        </label>

        <label>
          Image
          <span className="file-field">
            <input type="file" accept="image/*" onChange={updateImage} />
            <ImageIcon size={14} />
            <span>{form.imageUrl ? "Image attached" : "Attach image"}</span>
          </span>
        </label>

        {form.imageUrl && (
          <div className="image-preview">
            <img src={form.imageUrl} alt="Attached content preview" />
            <button type="button" className="secondary-button" onClick={() => setForm((currentForm) => ({ ...currentForm, imageUrl: "" }))}>
              Remove
            </button>
          </div>
        )}

        <div className="field-grid">
          <label>
            Scheduled Date
            <input name="scheduledDate" type="date" value={form.scheduledDate} onChange={updateField} onInput={updateField} />
          </label>
          <label>
            Scheduled Time
            <input name="scheduledTime" type="time" value={form.scheduledTime} onChange={updateField} onInput={updateField} />
          </label>
        </div>

        <SelectField label="Status" name="status" value={form.status} onChange={updateField} options={statuses} />

        {form.status === "Published" && (
          <div className="stats-editor">
            <label>
              Impressions
              <input name="impressions" type="number" min="0" value={form.impressions} onChange={updateField} />
            </label>
            <label>
              Likes
              <input name="likes" type="number" min="0" value={form.likes} onChange={updateField} />
            </label>
            <label>
              Comments
              <input name="comments" type="number" min="0" value={form.comments} onChange={updateField} />
            </label>
            <label>
              Shares
              <input name="shares" type="number" min="0" value={form.shares} onChange={updateField} />
            </label>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <footer className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSaving}>
            <Send size={12} />
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Content"}
          </button>
        </footer>
      </form>
    </div>
  );
}
