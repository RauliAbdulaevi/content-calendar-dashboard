export function getContentMetrics(ideas) {
  return {
    total: ideas.length,
    drafts: ideas.filter((idea) => idea.status === "Draft").length,
    scheduled: ideas.filter((idea) => idea.status === "Scheduled").length,
    published: ideas.filter((idea) => idea.status === "Published").length
  };
}

export function getPublishedStats(ideas) {
  return ideas
    .filter((idea) => idea.status === "Published")
    .reduce(
      (totals, idea) => {
        totals.impressions += Number(idea.stats?.impressions) || 0;
        totals.likes += Number(idea.stats?.likes) || 0;
        totals.comments += Number(idea.stats?.comments) || 0;
        totals.shares += Number(idea.stats?.shares) || 0;
        return totals;
      },
      { impressions: 0, likes: 0, comments: 0, shares: 0 }
    );
}

export function groupIdeasByDate(ideas) {
  return ideas.reduce((groups, idea) => {
    groups[idea.scheduledDate] = groups[idea.scheduledDate] || [];
    groups[idea.scheduledDate].push(idea);
    groups[idea.scheduledDate].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    return groups;
  }, {});
}

export function buildContentPayload(formData, imageUrl) {
  const status = String(formData.get("status") || "Draft");

  return {
    title: String(formData.get("title") || "").trim(),
    platform: String(formData.get("platform") || ""),
    contentType: String(formData.get("contentType") || ""),
    script: String(formData.get("script") || ""),
    caption: String(formData.get("caption") || ""),
    scheduledDate: String(formData.get("scheduledDate") || ""),
    scheduledTime: String(formData.get("scheduledTime") || ""),
    imageUrl,
    status,
    stats: {
      impressions: status === "Published" ? Number(formData.get("impressions")) || 0 : 0,
      likes: status === "Published" ? Number(formData.get("likes")) || 0 : 0,
      comments: status === "Published" ? Number(formData.get("comments")) || 0 : 0,
      shares: status === "Published" ? Number(formData.get("shares")) || 0 : 0
    }
  };
}
