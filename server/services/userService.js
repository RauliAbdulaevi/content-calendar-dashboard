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

    data.users = data.users.filter((user) => user.id !== id);
    data.ideas = data.ideas.filter((idea) => idea.userId !== id);
    recordActivity(data, adminUser, "user.deleted", `Deleted ${deletedUser.email}`);
  });
}
