import { isValidRole } from "../models/User.js";
import { mutateData, publicUser, readData } from "../models/store.js";
import { AppError } from "../utils/AppError.js";

export function listUsers() {
  return readData().users.map(publicUser);
}

export function updateRole(id, role) {
  if (!isValidRole(role)) {
    throw new AppError("Role must be admin or user.", 400);
  }

  return mutateData((data) => {
    const user = data.users.find((item) => item.id === id);

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    user.role = role;
    return publicUser(user);
  });
}

export function deleteUser(adminUser, id) {
  if (id === adminUser.id) {
    throw new AppError("Admins cannot delete their own account.", 400);
  }

  mutateData((data) => {
    const exists = data.users.some((user) => user.id === id);

    if (!exists) {
      throw new AppError("User not found.", 404);
    }

    data.users = data.users.filter((user) => user.id !== id);
    data.ideas = data.ideas.filter((idea) => idea.userId !== id);
  });
}
