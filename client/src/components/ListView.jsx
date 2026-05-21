import { Edit3, Image as ImageIcon, Trash2 } from "lucide-react";
import { formatReadableDate, formatTime } from "../utils/date.js";

export default function ListView({ ideas, onDeleteIdea, onEditIdea }) {
  if (!ideas.length) {
    return <p className="empty-state">No content ideas yet.</p>;
  }

  function handleDelete(idea) {
    const confirmed = window.confirm(`Delete "${idea.title}"? This cannot be undone.`);

    if (confirmed) {
      onDeleteIdea(idea.id);
    }
  }

  return (
    <section className="list-panel" aria-label="Content idea list">
      {ideas.map((idea) => (
        <article className="idea-row" key={idea.id}>
          {idea.imageUrl ? (
            <img className="idea-thumb" src={idea.imageUrl} alt="" />
          ) : (
            <span className="idea-thumb empty">
              <ImageIcon size={16} />
            </span>
          )}
          <div className="idea-main">
            <h3>{idea.title}</h3>
            <p>
              {idea.platform} - {idea.contentType} - {formatReadableDate(idea.scheduledDate)} at {formatTime(idea.scheduledTime)}
            </p>
            {idea.status === "Published" && (
              <p>
                {Number(idea.stats?.impressions || 0).toLocaleString()} impressions - {idea.stats?.likes || 0} likes - {idea.stats?.comments || 0} comments - {idea.stats?.shares || 0} shares
              </p>
            )}
          </div>
          <span className={`status-badge ${idea.status.toLowerCase()}`}>{idea.status}</span>
          <div className="idea-actions">
            <button className="edit-button" onClick={() => onEditIdea(idea)} type="button">
              <Edit3 size={13} />
              Edit
            </button>
            <button className="danger-button row-delete-button" onClick={() => handleDelete(idea)} type="button">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
