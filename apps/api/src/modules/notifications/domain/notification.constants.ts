export const NOTIFICATION_DEFAULT_PAGE = 1
export const NOTIFICATION_DEFAULT_LIMIT = 20
export const NOTIFICATION_MIN_LIMIT = 1
export const NOTIFICATION_MAX_LIMIT = 50

export const NOTIFICATION_TYPES = [
  'tracker_generation_completed',
  'tracker_generation_failed',
  'mock_test_generation_completed',
  'mock_test_generation_failed',
] as const
