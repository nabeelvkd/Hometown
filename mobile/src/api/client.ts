// Base URL of the Nattile backend. Override via EXPO_PUBLIC_API_URL.
// On a physical device, localhost won't resolve — set it to your machine's
// LAN IP, e.g. EXPO_PUBLIC_API_URL=http://192.168.1.5:5001/api
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://157.51.221.188:5001/api';

type Query = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(API_BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/**
 * Fetches and unwraps the backend's { success, data } envelope. Throws on
 * failure (callers fall back to bundled sample data). A short timeout keeps the
 * UI responsive when the API is unreachable.
 */
export async function apiGet<T>(path: string, query?: Query, timeoutMs = 4500): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(buildUrl(path, query), { signal: controller.signal });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
    }
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Minimal POST helper (used for anonymous pings). */
export async function apiPost<T>(path: string, body: unknown, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
    }
    return json.data as T;
  } finally {
    clearTimeout(timer);
  }
}
