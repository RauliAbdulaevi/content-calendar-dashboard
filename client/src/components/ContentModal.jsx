import { useMemo, useState } from "react";
import { Image as ImageIcon, MessageCircle, Send, Sparkles, Trash2, X } from "lucide-react";
import { contentTypes, defaultContentForm, platforms, statuses } from "../constants/content.js";
import { buildContentPayload, generateContentIdeas, getStatusClass } from "../utils/content.js";
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
    campaign: idea.campaign || "",
    approvalNote: idea.approvalNote || "",
    status: idea.status || "Draft",
    impressions: idea.stats?.impressions || 0,
    likes: idea.stats?.likes || 0,
    comments: idea.stats?.comments || 0,
    shares: idea.stats?.shares || 0
  };
}

function canApprove(user) {
  return ["admin", "manager"].includes(user?.role);
}

export default function ContentModal({ idea, onClose, onCreate, onUpdate, onDelete, selectedDate, currentUser, onAddComment }) {
  const isEditing = Boolean(idea);
  const [form, setForm] = useState(() => getInitialForm(idea, selectedDate));
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSaving, setSaving] = useState(false);

  const generatedIdeas = useMemo(
    () => generateContentIdeas({ platform: form.platform, contentType: form.contentType, campaign: form.campaign }),
    [form.platform, form.contentType, form.campaign]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function insertGenerated(generated) {
    setForm((currentForm) => ({
      ...currentForm,
      title: generated.title,
      script: generated.script,
      caption: `${generated.caption}\n\n${generated.hashtags}`
    }));
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

  async function handleDelete() {
    if (!isEditing) {
      return;
    }

    const confirmed = window.confirm("Delete this content idea? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    setError("");
    setSaving(true);
    try {
      await onDelete(idea.id);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    const message = comment.trim();

    if (!message || !isEditing) {
      return;
    }

    setError("");
    try {
      await onAddComment(idea.id, message);
      setComment("");
    } catch (commentError) {
      setError(commentError.message);
    }
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

  const approvalDisabled = ["Approved", "Published"].includes(form.status) && !canApprove(currentUser);

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal content-modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <span className="profile-modal-kicker">Content workflow</span>
            <h2>{isEditing ? "Edit Content Idea" : "New Content Idea"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-two-column">
          <div className="modal-form-stack">
            <label>
              Title / Idea
              <input name="title" value={form.title} onChange={updateField} placeholder="Give your content idea a title..." />
            </label>

            <div className="field-grid">
              <SelectField label="Platform" name="platform" value={form.platform} onChange={updateField} options={platforms} placeholder="Select platform" />
              <SelectField label="Content Type" name="contentType" value={form.contentType} onChange={updateField} options={contentTypes} placeholder="Select type" />
            </div>

            <label>
              Campaign
              <input name="campaign" value={form.campaign} onChange={updateField} placeholder="Launch, pillar, or campaign name" />
            </label>

            <section className="ai-panel" aria-label="AI content idea generator">
              <div className="section-heading">
                <h2>AI assistant</h2>
                <span>Optional</span>
              </div>
              <div className="ai-suggestions">
                {generatedIdeas.map((generated) => (
                  <button type="button" key={generated.title} onClick={() => insertGenerated(generated)}>
                    <Sparkles size={14} />
                    <span>{generated.title}</span>
                  </button>
                ))}
              </div>
            </section>

            <label>
              Post / Content Ideas
              <textarea name="script" value={form.script} onChange={updateField} placeholder="Write your post, bullet points, hooks, or content ideas here..." />
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

            <div className="field-grid">
              <SelectField label="Status" name="status" value={form.status} onChange={updateField} options={statuses} />
              <label>
                Approval note
                <input name="approvalNote" value={form.approvalNote} onChange={updateField} placeholder="Requested changes or approval context" />
              </label>
            </div>
            {approvalDisabled && <p className="form-hint">Admins and managers approve or publish posts.</p>}

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
          </div>

          <aside className="preview-panel" aria-label="Platform preview">
            <div className="preview-device">
              <div className="preview-topline">
                <strong>{form.platform || "Platform"}</strong>
                <span className={`status-badge ${getStatusClass(form.status)}`}>{form.status}</span>
              </div>
              <div className="preview-media">
                {form.imageUrl ? <img src={form.imageUrl} alt="" /> : <ImageIcon size={28} />}
              </div>
              <h3>{form.title || "Untitled post"}</h3>
              <p>{form.caption || "Your caption preview will appear here."}</p>
              <span>{form.contentType || "Post"} - {form.scheduledDate} {form.scheduledTime}</span>
            </div>

            {isEditing && (
              <section className="comments-panel" aria-label="Comments">
                <div className="section-heading">
                  <h2>Comments</h2>
                  <span>{idea.comments?.length || 0}</span>
                </div>
                <div className="comment-list">
                  {(idea.comments || []).map((item) => (
                    <article key={item.id}>
                      <strong>{item.authorName}</strong>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <p>{item.message}</p>
                    </article>
                  ))}
                  {!idea.comments?.length && <p className="empty-inline">No comments yet.</p>}
                </div>
                <div className="comment-compose">
                  <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Leave a comment or request changes..." />
                  <button type="button" className="secondary-button" onClick={handleCommentSubmit} disabled={!comment.trim()}>
                    <MessageCircle size={13} />
                    Comment
                  </button>
                </div>
              </section>
            )}
          </aside>
        </div>

        {error && <p className="form-error">{error}</p>}

        <footer className="modal-actions">
          {isEditing && (
            <button type="button" className="danger-button" onClick={handleDelete} disabled={isSaving}>
              <Trash2 size={12} />
              Delete
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={isSaving || approvalDisabled}>
            <Send size={12} />
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Content"}
          </button>
        </footer>
      </form>
    </div>
  );
}
