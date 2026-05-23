import { authRequest } from "./authApi.js";

export function getUsers() {
  return authRequest("/users");
}

export function updateUserRole(id, role) {
  return authRequest(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}

export function deleteUser(id) {
  return authRequest(`/users/${id}`, { method: "DELETE" });
}
