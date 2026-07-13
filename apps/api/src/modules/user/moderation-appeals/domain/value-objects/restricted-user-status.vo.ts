export type RestrictedUserStatus = 'blocked' | 'banned' | 'paused' | 'deactivated';

export const RESTRICTED_USER_BLOCKED_STATUS: RestrictedUserStatus = 'blocked';
export const RESTRICTED_USER_BANNED_STATUS: RestrictedUserStatus = 'banned';
export const RESTRICTED_USER_PAUSED_STATUS: RestrictedUserStatus = 'paused';
export const RESTRICTED_USER_DEACTIVATED_STATUS: RestrictedUserStatus = 'deactivated';

export const RESTRICTED_USER_STATUSES: readonly RestrictedUserStatus[] = [
  RESTRICTED_USER_BLOCKED_STATUS,
  RESTRICTED_USER_BANNED_STATUS,
  RESTRICTED_USER_PAUSED_STATUS,
  RESTRICTED_USER_DEACTIVATED_STATUS,
];
