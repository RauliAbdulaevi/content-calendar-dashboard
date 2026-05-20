import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";

export default function PublishedStats({ stats }) {
  const cards = [
    { label: "Impressions", value: stats.impressions, icon: Eye },
    { label: "Likes", value: stats.likes, icon: Heart },
    { label: "Comments", value: stats.comments, icon: MessageCircle },
    { label: "Shares", value: stats.shares, icon: Share2 }
  ];

  return (
    <section className="stats-strip" aria-label="Published post stats">
      {cards.map(({ label, value, icon: Icon }) => (
        <article className="stat-item" key={label}>
          <Icon size={14} />
          <span>{label}</span>
          <strong>{value.toLocaleString()}</strong>
        </article>
      ))}
    </section>
  );
}
