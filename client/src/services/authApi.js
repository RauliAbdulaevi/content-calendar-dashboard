const TOKEN_KEY = "content-calendar-token";

function uniqueUrls(urls) {
  return [...new Set(urls.filter(Boolean).map((url) => url.replace(/\/$/, "")))];
}

const API_URLS = uniqueUrls([
  import.meta.env.VITE_API_URL,
  `${window.location.protocol}//${window.location.hostname}:5000/api`,
  "http://localhost:5000/api",
  "http://127.0.0.1:5000/api"
]);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function authRequest(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let lastNetworkError = null;

  for (const apiUrl of API_URLS) {
    try {
      const response = await fetch(`${apiUrl}${path}`, { ...options, headers });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || error.message || "Request failed");
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    lastNetworkError
      ? "Could not reach the API server. Make sure the backend is running on port 5000."
      : "Request failed"
  );
}

export function register(payload) {
  return authRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return authRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser() {
  return authRequest("/auth/me");
}
