export const MODERATION_APPEAL_ROUTE_PATHS = {
  ROOT: '/',
  STATUS: '/status',
} as const;

export type ModerationAppealRoutePath =
  (typeof MODERATION_APPEAL_ROUTE_PATHS)[keyof typeof MODERATION_APPEAL_ROUTE_PATHS];
