export type WebEnvironment = {
  apiUrl: string;
  socketUrl?: string;
};

const parseAbsoluteHttpUrl = (value: string, key: string) => {
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${key} must use HTTP or HTTPS`);
  }
  return value.replace(/\/$/, '');
};

export const parseWebEnvironment = (source: Record<string, unknown>): WebEnvironment => {
  const rawApiUrl = source.VITE_API_URL;

  if (typeof rawApiUrl !== 'string' || rawApiUrl.trim() === '') {
    throw new Error('VITE_API_URL is required');
  }

  const apiUrl = rawApiUrl.trim().replace(/\/$/, '');
  const isRootRelative = apiUrl.startsWith('/') && !apiUrl.startsWith('//');

  if (!isRootRelative) parseAbsoluteHttpUrl(apiUrl, 'VITE_API_URL');

  const rawSocketUrl = source.VITE_SOCKET_URL;
  const socketUrl =
    typeof rawSocketUrl === 'string' && rawSocketUrl.trim()
      ? parseAbsoluteHttpUrl(rawSocketUrl.trim(), 'VITE_SOCKET_URL')
      : undefined;

  return { apiUrl, ...(socketUrl ? { socketUrl } : {}) };
};
