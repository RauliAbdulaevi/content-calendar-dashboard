import { BarChart3, CalendarDays, CheckCircle2, Square } from "lucide-react";

export default function Metrics({ metrics }) {
  const cards = [
    { label: "Total Ideas", value: metrics.total, icon: BarChart3, tone: "neutral" },
    { label: "Drafts", value: metrics.drafts, icon: Square, tone: "draft" },
    { label: "Scheduled", value: metrics.scheduled, icon: CalendarDays, tone: "scheduled" },
    { label: "Published", value: metrics.published, icon: CheckCircle2, tone: "published" }
  ];

  return (
    <section className="metrics-grid" aria-label="Content idea totals">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article className="metric-card" key={label}>
          <span className={`metric-icon ${tone}`}>
            <Icon size={17} />
          </span>
          <div>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
