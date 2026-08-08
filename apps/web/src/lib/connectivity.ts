const CONNECTIVITY_CHECK_TIMEOUT_MS = 4_000;

/**
 * `navigator.onLine` only reflects the browser's network-adapter state and can
 * report false while this application is still reachable. Use it as a hint,
 * then verify connectivity against an uncached same-origin resource.
 */
export async function canReachAppOrigin(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CONNECTIVITY_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`/robots.txt?connectivity-check=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function isAppReachable(): Promise<boolean> {
  return navigator.onLine || canReachAppOrigin();
}
