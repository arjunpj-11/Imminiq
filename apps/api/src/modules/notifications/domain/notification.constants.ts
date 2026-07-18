export const NOTIFICATION_DEFAULT_PAGE = 1;
export const NOTIFICATION_DEFAULT_LIMIT = 20;
export const NOTIFICATION_MIN_LIMIT = 1;
export const NOTIFICATION_MAX_LIMIT = 50;

export const NOTIFICATION_TYPES = [
  'tracker_generation_completed',
  'tracker_generation_failed',
  'mock_test_generation_completed',
  'mock_test_generation_failed',
  'tracker_topic_contribution_requested',
  'tracker_topic_contribution_approved',
  'tracker_topic_contribution_rejected',
  'admin_broadcast',
  'friend_request_received',
  'friend_request_accepted',
  'tracker_clan_join_requested',
  'tracker_clan_join_reviewed',
  'tracker_clan_role_invitation',
  'tracker_clan_role_invitation_response',
  'tracker_clan_challenge_received',
  'tracker_clan_challenge_accepted',
  'tracker_clan_challenge_declined',
  'tracker_clan_challenge_cancelled',
  'tracker_clan_challenge_completed',
] as const;
