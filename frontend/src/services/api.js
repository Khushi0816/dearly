const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const TOKEN_KEY = "dearly_access_token";

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAccessToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = Object.prototype.hasOwnProperty.call(options, "token")
    ? options.token
    : getAccessToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to Dearly's server. Please check that the backend is running."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = data?.detail || "Something went wrong.";

    if (Array.isArray(message)) {
      message = message
        .map((item) => item.msg || "Invalid input")
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
}

export function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
    token: null,
  });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    token: null,
  });
}

export function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    method: "GET",
    ...(token ? { token } : {}),
  });
}
