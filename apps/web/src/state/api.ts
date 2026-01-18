export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const getAuthHeaders = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem("devassist.auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessToken) {
        return { Authorization: `Bearer ${parsed.accessToken}` };
      }
    }
  } catch {
    // ignore
  }
  return {};
};

export const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: mergedHeaders
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response.json() as Promise<T>;
};

// Simple axios-like api helper
export const api = {
  get: async <T = unknown>(path: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path);
    return { data };
  },
  post: async <T = unknown>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  put: async <T = unknown>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  patch: async <T = unknown>(path: string, body?: unknown): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
    return { data };
  },
  delete: async <T = unknown>(path: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(path, { method: "DELETE" });
    return { data };
  },
};
