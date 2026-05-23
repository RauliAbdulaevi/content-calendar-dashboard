import { mutateData, publicUser, readData } from "../models/store.js";

export function recordActivity(data, user, action, message) {
  data.activityLogs = data.activityLogs || [];
  data.nextActivityId = data.nextActivityId || 1;
  data.activityLogs.unshift({
    id: data.nextActivityId++,
    userId: user?.id || null,
    userEmail: user?.email || "system",
    action,
    message,
    createdAt: new Date().toISOString()
  });
  data.activityLogs = data.activityLogs.slice(0, 80);
}

export function listActivityLogs() {
  const data = readData();
  const usersById = new Map(data.users.map((user) => [user.id, publicUser(user)]));

  return (data.activityLogs || []).map((log) => ({
    ...log,
    user: usersById.get(log.userId) || null
  }));
}

export function addSystemActivity(action, message) {
  mutateData((data) => recordActivity(data, null, action, message));
}
