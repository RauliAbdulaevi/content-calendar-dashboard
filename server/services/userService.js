import { isValidRole } from "../models/User.js";
import { mutateData, publicUser, readData } from "../models/store.js";
import { AppError } from "../utils/AppError.js";
import { recordActivity } from "./activityService.js";

export function listUsers() {
  return readData().users.map(publicUser);
}

export function updateRole(adminUser, id, role) {
  if (!isValidRole(role)) {
    throw new AppError("Role must be admin or user.", 400);
  }

  return mutateData((data) => {
    const user = data.users.find((item) => item.id === id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    user.role = role;
    recordActivity(data, adminUser, "user.role", `Changed ${user.email} to ${role}`);
    return publicUser(user);
  });
}

export function deleteUser(adminUser, id) {
  if (id === adminUser.id) {
    throw new AppError("Admins cannot delete their own account.", 400);
  }

  mutateData((data) => {
    const deletedUser = data.users.find((user) => user.id === id);

    if (!deletedUser) {
      throw new AppError("User not found.", 404);
    }

    const deletedIdeas = data.ideas.filter((idea) => idea.userId === id);

    data.users = data.users.filter((user) => user.id !== id);
    data.ideas = data.ideas.filter((idea) => idea.userId !== id);
    recordActivity(data, adminUser, "user.deleted", `Deleted ${deletedUser.email}`, { deletedUser, deletedIdeas });
  });
}

export function recoverDeletedUser(adminUser, activityId) {
  return mutateData((data) => {
    const activity = data.activityLogs.find((log) => log.id === activityId);

    if (!activity || activity.action !== "user.deleted" || !activity.metadata?.deletedUser) {
      throw new AppError("Recoverable delete activity was not found.", 404);
    }

    if (activity.recoveredAt) {
      throw new AppError("This user has already been recovered.", 409);
    }

    const { deletedUser, deletedIdeas = [] } = activity.metadata;
    const emailExists = data.users.some((user) => user.email.toLowerCase() === deletedUser.email.toLowerCase());
    const idExists = data.users.some((user) => user.id === deletedUser.id);

    if (emailExists || idExists) {
      throw new AppError("This user cannot be recovered because the account already exists.", 409);
    }

    data.users.push(deletedUser);

    const ideaIds = new Set(data.ideas.map((idea) => idea.id));
    const restorableIdeas = deletedIdeas.filter((idea) => !ideaIds.has(idea.id));
    data.ideas.push(...restorableIdeas);
    data.nextUserId = Math.max(data.nextUserId || 1, deletedUser.id + 1, ...data.users.map((user) => user.id + 1));
    data.nextIdeaId = Math.max(data.nextIdeaId || 1, ...data.ideas.map((idea) => idea.id + 1));

    activity.recoveredAt = new Date().toISOString();
    activity.recoveredBy = adminUser.id;
    recordActivity(data, adminUser, "user.recovered", `Recovered ${deletedUser.email}`);

    return publicUser(deletedUser);
  });
}
