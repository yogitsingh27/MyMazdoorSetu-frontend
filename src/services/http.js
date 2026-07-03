// Transport layer.
// Two modes, chosen per service method via USE_API:
//  - mock mode (VITE_USE_API off): services resolve from local mock data via respond()/fail()
//  - API mode  (VITE_USE_API on):  services call the ASP.NET Core backend via request()
// This lets the app toggle between mock and real backend during development.

const LATENCY = 350; // ms — simulate a network round-trip so loading states show (mock mode).

export const USE_API =
  import.meta.env.VITE_USE_API === 'true' || import.meta.env.VITE_USE_API === '1';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Surface a clear configuration error early: API mode requires VITE_API_URL.
// (No hardcoded default — a missing URL is a configuration mistake, not something to guess.)
if (USE_API && !API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.error(
    '[config] VITE_USE_API is enabled but VITE_API_URL is not set. ' +
    'Set VITE_API_URL (e.g. http://localhost:5199/api/v1) in your .env file, ' +
    'or set VITE_USE_API=false to use mock data.',
  );
}

export class ApiError extends Error {
  constructor(status, code, detail) {
    super(detail || `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code; // machine-readable code from the backend ProblemDetails (localizable client-side)
  }
}

/** Real HTTP call to the backend. Throws ApiError on non-2xx. */
export async function request(path, { params, method = 'GET', signal } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError(0, 'config.missing_api_url', 'VITE_API_URL is not configured.');
  }
  const url = new URL(API_BASE_URL.replace(/\/+$/, '') + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        url.searchParams.set(key, value);
      }
    }
  }
  const res = await fetch(url, { method, headers: { Accept: 'application/json' }, signal });
  if (!res.ok) {
    let code;
    let detail;
    try {
      const body = await res.json();
      code = body.code;
      detail = body.detail;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, code || 'unknown', detail);
  }
  return res.status === 204 ? null : res.json();
}

/** GET that resolves to null on 404 — used by detail lookups so pages show their not-found state. */
export async function getOrNull(path) {
  try {
    return await request(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Resolve with a deep-cloned copy of mock data after a short delay (mock mode). */
export function respond(data, { latency = LATENCY } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), latency);
  });
}

/** Reject after a delay — used to exercise error states (mock mode). */
export function fail(message, { latency = LATENCY } = {}) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), latency);
  });
}
