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

export function filterIdeas(ideas, filters) {
  const search = filters.search.trim().toLowerCase();

  return ideas.filter((idea) => {
    const matchesSearch =
      !search ||
      [idea.title, idea.platform, idea.contentType, idea.caption, idea.script]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search));
    const matchesStatus = filters.status === "All" || idea.status === filters.status;
    const matchesPlatform = filters.platform === "All" || idea.platform === filters.platform;
    const matchesType = filters.contentType === "All" || idea.contentType === filters.contentType;

    return matchesSearch && matchesStatus && matchesPlatform && matchesType;
  });
}

export function getStatusClass(status = "") {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function getAnalyticsSummary(ideas) {
  const published = ideas.filter((idea) => idea.status === "Published");
  const stats = getPublishedStats(ideas);
  const engagement = stats.likes + stats.comments + stats.shares;
  const engagementRate = stats.impressions ? Math.round((engagement / stats.impressions) * 1000) / 10 : 0;
  const platformTotals = ideas.reduce((totals, idea) => {
    totals[idea.platform] = (totals[idea.platform] || 0) + 1;
    return totals;
  }, {});
  const topPlatform = Object.entries(platformTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "No platform yet";
  const nextPost = ideas
    .filter((idea) => idea.status !== "Published")
    .sort((a, b) => `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime}`))[0];

  return {
    publishedCount: published.length,
    engagement,
    engagementRate,
    topPlatform,
    nextPost
  };
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
