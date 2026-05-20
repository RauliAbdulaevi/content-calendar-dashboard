import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { groupIdeasByDate } from "../utils/content.js";
import { buildCalendarCells, formatReadableDate } from "../utils/date.js";

export default function CalendarView({ ideas, currentMonth, onPrevious, onNext, onToday, onSelectDate, onEditIdea }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const cells = buildCalendarCells(year, month);
  const ideasByDate = groupIdeasByDate(ideas);

  return (
    <section className="calendar-section">
      <div className="calendar-toolbar">
        <h2>{monthName}</h2>
        <div className="month-controls">
          <button aria-label="Previous month" onClick={onPrevious}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={onToday}>Today</button>
          <button aria-label="Next month" onClick={onNext}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="weekday-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, index) => {
          const dayIdeas = cell.date ? ideasByDate[cell.iso] || [] : [];
          const isToday = cell.iso === "2026-05-20";

          return (
            <article
              className={`calendar-cell ${!cell.inMonth ? "muted" : ""} ${isToday ? "today" : ""}`}
              key={`${cell.iso || "empty"}-${index}`}
              role={cell.inMonth ? "button" : undefined}
              tabIndex={cell.inMonth ? 0 : undefined}
              aria-label={cell.inMonth ? `Create content for ${formatReadableDate(cell.iso)}` : undefined}
              onClick={cell.inMonth ? () => onSelectDate(cell.iso) : undefined}
              onKeyDown={
                cell.inMonth
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectDate(cell.iso);
                      }
                    }
                  : undefined
              }
            >
              {cell.date && <span className="day-number">{cell.date.getDate()}</span>}
              <div className="cell-events">
                {dayIdeas.slice(0, 3).map((idea) => (
                  <button
                    className={`event-pill ${idea.status.toLowerCase()}`}
                    key={idea.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditIdea(idea);
                    }}
                    type="button"
                  >
                    <span>{idea.scheduledTime}</span>
                    {idea.imageUrl && <ImageIcon size={10} />}
                    {idea.title}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
