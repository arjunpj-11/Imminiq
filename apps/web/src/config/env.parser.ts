export type WebEnvironment = {
  apiUrl: string;
  socketUrl?: string;
  webrtcStunUrl: string;
  webrtcTurnUrl?: string;
  webrtcTurnUsername?: string;
  webrtcTurnCredential?: string;
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

  const rawTurnUrl = source.VITE_WEBRTC_TURN_URL;
  const webrtcTurnUrl =
    typeof rawTurnUrl === 'string' && rawTurnUrl.trim() ? rawTurnUrl.trim() : undefined;
  if (webrtcTurnUrl && !/^turns?:/i.test(webrtcTurnUrl)) {
    throw new Error('VITE_WEBRTC_TURN_URL must use TURN or TURNS');
  }
  const rawTurnUsername = source.VITE_WEBRTC_TURN_USERNAME;
  const rawTurnCredential = source.VITE_WEBRTC_TURN_CREDENTIAL;
  const webrtcTurnUsername =
    typeof rawTurnUsername === 'string' && rawTurnUsername.trim()
      ? rawTurnUsername.trim()
      : undefined;
  const webrtcTurnCredential =
    typeof rawTurnCredential === 'string' && rawTurnCredential.trim()
      ? rawTurnCredential.trim()
      : undefined;
  if (Boolean(webrtcTurnUsername) !== Boolean(webrtcTurnCredential)) {
    throw new Error('WebRTC TURN username and credential must be configured together');
  }

  return {
    apiUrl,
    ...(socketUrl ? { socketUrl } : {}),
    webrtcStunUrl,
    ...(webrtcTurnUrl ? { webrtcTurnUrl } : {}),
    ...(webrtcTurnUsername ? { webrtcTurnUsername } : {}),
    ...(webrtcTurnCredential ? { webrtcTurnCredential } : {}),
  };
};
