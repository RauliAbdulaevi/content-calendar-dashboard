import { authRequest } from "./authApi.js";

export function getIdeas() {
  return authRequest("/ideas");
}

export function createIdea(payload) {
  return authRequest("/ideas", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateIdea(id, payload) {
  return authRequest(`/ideas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function addIdeaComment(id, payload) {
  return authRequest(`/ideas/${id}/comments`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getNotifications() {
  return authRequest("/ideas/notifications");
}

export function deleteIdea(id) {
  return authRequest(`/ideas/${id}`, { method: "DELETE" });
}
