export const VALID_ROLES = ["admin", "user"];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}
