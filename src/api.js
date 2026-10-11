// Centralized API client for ScholarshipConnect AI

// Normalize API_BASE to handle trailing slashes and ensure /api prefix is present when domain is supplied
function resolveApiBase() {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();
  if (!envUrl) return "/api";
  
  const stripped = envUrl.replace(/\/+$/, "");
  if (stripped.startsWith("http://") || stripped.startsWith("https://")) {
    if (!stripped.endsWith("/api")) {
      return `${stripped}/api`;
    }
  }
  return stripped || "/api";
}

const API_BASE = resolveApiBase();

function getToken() {
  try {
    return localStorage.getItem("sc-token") || "";
  } catch (e) {
    return "";
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem("sc-token", token);
    } else {
      localStorage.removeItem("sc-token");
    }
  } catch (e) {}
}

async function request(endpoint, options = {}) {
  let url;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    url = endpoint;
  } else {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    url = `${API_BASE}${cleanEndpoint}`;
  }

  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg =
        (data && data.message) || (data && data.error) || `Request failed with status ${res.status}`;
      return { success: false, status: res.status, error: errorMsg, data };
    }

    return data;
  } catch (error) {
    console.warn(`[API] Network error requesting ${url}:`, error.message);
    return { success: false, networkError: true, error: error.message };
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    let url = endpoint;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.append(k, v);
    });
    const qs = query.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
    return request(url, { method: "GET" });
  },

  post: (endpoint, body) => request(endpoint, { method: "POST", body }),

  put: (endpoint, body) => request(endpoint, { method: "PUT", body }),

  patch: (endpoint, body) => request(endpoint, { method: "PATCH", body }),

  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};

export default api;
