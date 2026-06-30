// Mock transport layer.
// Every service goes through here, so when the ASP.NET Core API is ready you
// replace ONLY the body of `respond` (and add `request`) with real fetch calls.
// Components and contexts never change.

const LATENCY = 350; // ms — simulate a network round-trip so loading states show.

/** Resolve with a deep-cloned copy of mock data after a short delay. */
export function respond(data, { latency = LATENCY } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), latency);
  });
}

/** Reject after a delay — used to exercise error states. */
export function fail(message, { latency = LATENCY } = {}) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), latency);
  });
}

/*
 * FUTURE (Phase with backend):
 *
 * const BASE_URL = import.meta.env.VITE_API_URL;
 * export async function request(path, options = {}) {
 *   const res = await fetch(`${BASE_URL}${path}`, {
 *     headers: { 'Content-Type': 'application/json', ...authHeader() },
 *     ...options,
 *   });
 *   if (!res.ok) throw new Error(`API ${res.status}`);
 *   return res.status === 204 ? null : res.json();
 * }
 */
