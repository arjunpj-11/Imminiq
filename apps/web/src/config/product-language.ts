export const PRODUCT_LANGUAGE = {
  assistant: 'Ask Immi',
  guild: 'Guild',
  guildPlural: 'Guilds',
  tracker: 'Tracker',
  trackerPlural: 'Trackers',
  verificationQueue: 'Verification Queue',
  questionReportQueue: 'Question Report Queue',
  trackerReportQueue: 'Tracker Report Queue',
} as const;

const STATUS_LABELS: Record<string, string> = {
  paused: 'Suspended',
  under_review: 'Under review',
  in_progress: 'In progress',
  on_track: 'On track',
  past_due: 'Past due',
};

export const formatProductLabel = (value: string) =>
  STATUS_LABELS[value.toLowerCase()] ??
  value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
