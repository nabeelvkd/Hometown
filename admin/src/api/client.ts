import type { ApiErrorBody, ApiSuccess, PaginationMeta } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'nattile_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export interface Result<T> {
  data: T;
  meta?: PaginationMeta;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(BASE_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Thin fetch wrapper that attaches the JWT, unwraps the success envelope and
 * throws a typed ApiError on failure. A 401 clears the stored token so the app
 * can bounce back to the login screen.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<Result<T>> {
  const token = getToken();
  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!res.ok || !json || json.success === false) {
    if (res.status === 401) setToken(null);
    const message =
      json && json.success === false ? json.error.message : `Request failed (${res.status})`;
    const details = json && json.success === false ? json.error.details : undefined;
    throw new ApiError(res.status, message, details);
  }

  return { data: json.data, meta: json.meta };
}

/** Uploads an image file to the backend (Cloudinary) and returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(BASE_URL + '/uploads/image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = (await res.json().catch(() => null)) as
    | { success: true; data: { url: string } }
    | { success: false; error: { message: string } }
    | null;
  if (!res.ok || !json || json.success === false) {
    if (res.status === 401) setToken(null);
    throw new ApiError(res.status, json && !json.success ? json.error.message : `Upload failed (${res.status})`);
  }
  return json.data.url;
}
