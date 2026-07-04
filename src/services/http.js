// Transport layer.
// Two modes, chosen per service method via USE_API:
//  - mock mode (VITE_USE_API off): services resolve from local mock data via respond()/fail()
//  - API mode  (VITE_USE_API on):  services call the ASP.NET Core backend via request()
//
// Auth: the JWT access token is held in memory only (below). The refresh token
// lives in an httpOnly cookie the browser sends automatically. On a 401 we
// transparently refresh once and retry.

const LATENCY = 350; // ms — simulate a network round-trip so loading states show (mock mode).

export const USE_API =
  import.meta.env.VITE_USE_API === 'true' || import.meta.env.VITE_USE_API === '1';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (USE_API && !API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.error(
    '[config] VITE_USE_API is enabled but VITE_API_URL is not set. ' +
    'Set VITE_API_URL (e.g. /api/v1 in dev, or the API URL in prod), ' +
    'or set VITE_USE_API=false to use mock data.',
  );
}

// --- Access token (in memory only) + session-lost hook ---
let accessToken = null;
let refreshPromise = null;
let onSessionExpired = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const setSessionExpiredHandler = (fn) => { onSessionExpired = fn; };

export class ApiError extends Error {
  constructor(status, code, detail) {
    super(detail || `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code; // machine-readable code from the backend ProblemDetails
  }
}

function buildUrl(path, params) {
  // API_BASE_URL may be relative ("/api/v1") — resolve against the app origin.
  const url = new URL(API_BASE_URL.replace(/\/+$/, '') + path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url;
}

// Raw refresh — deliberately does NOT go through request() (avoids 401 recursion).
async function rawRefresh() {
  const res = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    accessToken = null;
    let code;
    try { code = (await res.json()).code; } catch { /* ignore */ }
    throw new ApiError(res.status, code || 'auth.invalid_refresh');
  }
  const data = await res.json();
  accessToken = data.accessToken;
  return data; // AuthResponse { accessToken, user, ... }
}

// Concurrent 401s share a single in-flight refresh.
function refresh() {
  if (!refreshPromise) refreshPromise = rawRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

// Used by AuthContext on app mount to restore the session (returns the user or throws).
export async function refreshSession() {
  return (await refresh()).user;
}

export async function request(path, { params, method = 'GET', body, signal, skipRefresh = false } = {}) {
  if (!API_BASE_URL) {
    throw new ApiError(0, 'config.missing_api_url', 'VITE_API_URL is not configured.');
  }

  const doFetch = () => {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(buildUrl(path, params), {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let res = await doFetch();

  // Transparent refresh-and-retry once on 401 (except for the auth flows themselves).
  if (res.status === 401 && !skipRefresh) {
    try {
      await refresh();
    } catch {
      if (onSessionExpired) onSessionExpired();
      throw new ApiError(401, 'auth.session_expired', 'Your session has expired. Please log in again.');
    }
    res = await doFetch();
  }

  if (!res.ok) {
    let code;
    let detail;
    try {
      const b = await res.json();
      code = b.code;
      detail = b.detail;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, code || 'unknown', detail);
  }

  return res.status === 204 ? null : res.json();
}

export async function getOrNull(path) {
  try {
    return await request(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function respond(data, { latency = LATENCY } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), latency);
  });
}

export function fail(message, { latency = LATENCY } = {}) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), latency);
  });
}
