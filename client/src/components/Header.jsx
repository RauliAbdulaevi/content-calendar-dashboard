import { Plus } from "lucide-react";

export default function Header({ onNewContent }) {
  return (
    <header className="header">
      <div>
        <h1>Rauli's Content Calendar</h1>
        <p>Plan posts, attach visuals, choose publish times, and track published results.</p>
      </div>
      <button className="primary-button" onClick={onNewContent}>
        <Plus size={14} />
        New Content
      </button>
    </header>
  );
}
