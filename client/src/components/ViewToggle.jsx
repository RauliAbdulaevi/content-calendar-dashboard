import { CalendarDays, List } from "lucide-react";

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="view-toggle" role="tablist" aria-label="Calendar display mode">
      <button className={view === "calendar" ? "active" : ""} onClick={() => onChange("calendar")}>
        <CalendarDays size={13} />
        Calendar View
      </button>
      <button className={view === "list" ? "active" : ""} onClick={() => onChange("list")}>
        <List size={13} />
        List View
      </button>
    </div>
  );
}
