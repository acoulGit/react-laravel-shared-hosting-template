/**
 * Helper API pour les requêtes avec Bearer token (shared-hosting friendly)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export interface ApiError {
  status: number;
  message: string;
}

export function getToken(): string | null {
  return localStorage.getItem("app_token");
}

export function setToken(token: string): void {
  localStorage.setItem("app_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("app_token");
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) (headers as any)["Authorization"] = `Bearer ${token}`;

  let body: any = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body != null && !isFormData && typeof body === "object") {
    body = JSON.stringify(body);
  }

  if (body != null && !isFormData) {
    const hasContentType = Object.keys(headers).some(
      (k) => k.toLowerCase() === "content-type"
    );
    if (!hasContentType) (headers as any)["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    redirect: "manual",
  });

  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  let data: any = null;
  if (text) {
    if (contentType.includes("application/json")) {
      data = JSON.parse(text);
    } else {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors && (Object.values(data.errors)[0] as any)?.[0]) ||
      res.statusText ||
      "Erreur API";
    throw { status: res.status, message } as ApiError;
  }

  return data as T;
}
