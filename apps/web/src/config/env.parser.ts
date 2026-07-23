export type WebEnvironment = {
  apiUrl: string;
  socketUrl?: string;
  webrtcStunUrl: string;
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
  if (source.PROD === true && !isRootRelative && new URL(apiUrl).protocol !== 'https:') {
    throw new Error('VITE_API_URL must use HTTPS in production');
  }

  const rawSocketUrl = source.VITE_SOCKET_URL;
  const socketUrl =
    typeof rawSocketUrl === 'string' && rawSocketUrl.trim()
      ? parseAbsoluteHttpUrl(rawSocketUrl.trim(), 'VITE_SOCKET_URL')
      : undefined;
  if (source.PROD === true && socketUrl && new URL(socketUrl).protocol !== 'https:') {
    throw new Error('VITE_SOCKET_URL must use HTTPS in production');
  }

  const rawStunUrl = source.VITE_WEBRTC_STUN_URL;
  const webrtcStunUrl =
    typeof rawStunUrl === 'string' && /^stuns?:/i.test(rawStunUrl.trim())
      ? rawStunUrl.trim()
      : 'stun:stun.l.google.com:19302';

  return {
    apiUrl,
    ...(socketUrl ? { socketUrl } : {}),
    webrtcStunUrl,
  };
};
