const API_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getIdeas() {
  return request("/ideas");
}

export function createIdea(payload) {
  return request("/ideas", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateIdea(id, payload) {
  return request(`/ideas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteIdea(id) {
  return request(`/ideas/${id}`, { method: "DELETE" });
}
