import { Activity, BarChart3, Layers3, MousePointer2, TrendingUp } from "lucide-react";
import { formatReadableDate, formatTime } from "../utils/date.js";

export default function AnalyticsPanel({ analytics }) {
  const cards = [
    { label: "Published posts", value: analytics.publishedCount, icon: BarChart3 },
    { label: "Impressions", value: analytics.impressions.toLocaleString(), icon: MousePointer2 },
    { label: "Total engagement", value: analytics.engagement.toLocaleString(), icon: Activity },
    { label: "Engagement rate", value: `${analytics.engagementRate}%`, icon: TrendingUp },
    { label: "Best platform", value: analytics.topPlatform, icon: MousePointer2 },
    { label: "Best type", value: analytics.bestContentType, icon: Layers3 }
  ];

  return (
    <section className="analytics-panel" aria-label="Content analytics">
      <div className="section-heading">
        <h2>Analytics</h2>
        {analytics.nextPost ? (
          <span>Next: {formatReadableDate(analytics.nextPost.scheduledDate)} at {formatTime(analytics.nextPost.scheduledTime)}</span>
        ) : (
          <span>No upcoming posts</span>
        )}
      </div>
      <div className="analytics-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="analytics-card" key={label}>
            <Icon size={16} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      {analytics.recentPerformance.length > 0 && (
        <div className="performance-list" aria-label="Recent performance">
          {analytics.recentPerformance.map((idea) => (
            <article key={idea.id}>
              <span>{idea.platform}</span>
              <strong>{idea.title}</strong>
              <p>
                {Number(idea.stats?.impressions || 0).toLocaleString()} impressions - {Number(idea.stats?.likes || 0).toLocaleString()} likes
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
