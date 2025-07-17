// src/api.ts
// Centralized API config and helper for backend communication

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function apiFetch(endpoint: string, options: RequestInit & { responseType?: 'json' | 'blob' } = {}) {
  const { responseType = 'json', ...fetchOptions } = options;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include", // for cookies/auth
    headers: {
      // Only set content-type for JSON requests, or if specified.
      ...(responseType === 'json' && { 'Content-Type': 'application/json' }),
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }

  if (responseType === 'blob') {
    return res.blob();
  }

  return res.json();
}

export const fetchAllUsers = () => {
  return apiFetch('/admin/users');
};

export const fetchAllPayments = () => {
  return apiFetch('/admin/payments');
};

