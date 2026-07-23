export const CALL_RING_TIMEOUT_MS = 45_000;

export const CALL_RESPONSE_MESSAGES = {
  ACTIVE_LOADED: 'Active call loaded',
  ICE_SERVERS_LOADED: 'Secure call configuration loaded',
  HISTORY_LOADED: 'Call history loaded',
  STARTED: 'Call started',
  RESPONDED: 'Call response saved',
  ENDED: 'Call ended',
} as const;
