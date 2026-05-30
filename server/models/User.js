export const VALID_ROLES = ["admin", "manager", "creator", "viewer", "user"];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

export function canManageUsers(user) {
  return user?.role === "admin";
}

export function canApproveContent(user) {
  return ["admin", "manager"].includes(user?.role);
}

export function canCreateContent(user) {
  return ["admin", "manager", "creator", "user"].includes(user?.role);
}
