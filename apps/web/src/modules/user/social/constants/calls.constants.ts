export const CALL_ENDPOINTS = {
  root: '/calls',
  active: '/calls/active',
  iceServers: '/calls/ice-servers',
  respond: (callId: string) => `/calls/${callId}/respond`,
  end: (callId: string) => `/calls/${callId}/end`,
} as const;

export const CALL_REASON_MAX_LENGTH = 240;
export const CALL_HISTORY_PAGE_SIZE = 30;
