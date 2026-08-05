import { API_PREFIX, clearAuth, getToken } from "./api";
import { ApiRequestError, type ApiFieldError } from "./errors";

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: QueryParams;
  body?: unknown;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${API_PREFIX}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith("/auth/");
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) {
    requestHeaders.Authorization = `Token ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let error = "Request failed. Please try again.";
    let details: ApiFieldError[] | null = null;
    try {
      const data = await response.json();
      if (typeof data?.error === "string") error = data.error;
      else if (typeof data?.detail === "string") error = data.detail;
      details = data?.details ?? null;
    } catch {
      // ignore non-JSON error bodies
    }

    if (response.status === 401 && !isAuthEndpoint(path)) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    throw new ApiRequestError(error, response.status, details);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(
    path: string,
    options: Omit<RequestOptions, "body" | "method"> = {}
  ): Promise<T> {
    return apiFetch<T>(path, { ...options, method: "GET" });
  },
  post<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "body" | "method"> = {}
  ): Promise<T> {
    return apiFetch<T>(path, { ...options, method: "POST", body });
  },
  patch<T>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, "body" | "method"> = {}
  ): Promise<T> {
    return apiFetch<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(
    path: string,
    options: Omit<RequestOptions, "body" | "method"> = {}
  ): Promise<T> {
    return apiFetch<T>(path, { ...options, method: "DELETE" });
  },
};
