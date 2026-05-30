export const statuses = ["Idea", "Draft", "In Review", "Approved", "Scheduled", "Published"];

export function normalizeStats(stats = {}) {
  return {
    impressions: Number(stats.impressions) || 0,
    likes: Number(stats.likes) || 0,
    comments: Number(stats.comments) || 0,
    shares: Number(stats.shares) || 0
  };
}

export function canAccessIdea(user, idea) {
  return ["admin", "manager", "viewer"].includes(user.role) || idea.userId === user.id;
}

export function canEditIdea(user, idea) {
  return ["admin", "manager"].includes(user.role) || idea.userId === user.id;
}
