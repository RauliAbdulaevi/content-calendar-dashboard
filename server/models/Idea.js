export const statuses = ["Draft", "Scheduled", "Published"];

export function normalizeStats(stats = {}) {
  return {
    impressions: Number(stats.impressions) || 0,
    likes: Number(stats.likes) || 0,
    comments: Number(stats.comments) || 0,
    shares: Number(stats.shares) || 0
  };
}

export function canAccessIdea(user, idea) {
  return user.role === "admin" || idea.userId === user.id;
}
