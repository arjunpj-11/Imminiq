export type PaginationConfig = Readonly<{
  defaultLimit: number;
  profileLimit: number;
  compactLimit: number;
  gridLimit: number;
  adminLimit: number;
  batchLimit: number;
  messageLimit: number;
  lookupLimit: number;
  dashboardBattleLimit: number;
  dashboardFriendLimit: number;
  profileHighlightLimit: number;
}>;

const readPositiveInteger = (
  source: Record<string, unknown>,
  key: string,
  fallback: number,
  maximum: number
) => {
  const rawValue = source[key];
  if (rawValue === undefined || rawValue === '') return fallback;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${key} must be an integer between 1 and ${maximum}`);
  }
  return value;
};

export const parsePaginationConfig = (source: Record<string, unknown>): PaginationConfig =>
  Object.freeze({
    defaultLimit: readPositiveInteger(source, 'VITE_PAGINATION_DEFAULT_LIMIT', 20, 100),
    profileLimit: readPositiveInteger(source, 'VITE_PAGINATION_PROFILE_LIMIT', 10, 50),
    compactLimit: readPositiveInteger(source, 'VITE_PAGINATION_COMPACT_LIMIT', 6, 50),
    gridLimit: readPositiveInteger(source, 'VITE_PAGINATION_GRID_LIMIT', 12, 50),
    adminLimit: readPositiveInteger(source, 'VITE_PAGINATION_ADMIN_LIMIT', 25, 100),
    batchLimit: readPositiveInteger(source, 'VITE_PAGINATION_BATCH_LIMIT', 50, 100),
    messageLimit: readPositiveInteger(source, 'VITE_PAGINATION_MESSAGE_LIMIT', 60, 100),
    lookupLimit: readPositiveInteger(source, 'VITE_PAGINATION_LOOKUP_LIMIT', 100, 100),
    dashboardBattleLimit: readPositiveInteger(source, 'VITE_DASHBOARD_RECENT_BATTLE_LIMIT', 3, 20),
    dashboardFriendLimit: readPositiveInteger(source, 'VITE_DASHBOARD_FRIEND_LIMIT', 4, 20),
    profileHighlightLimit: readPositiveInteger(source, 'VITE_PROFILE_HIGHLIGHT_LIMIT', 3, 20),
  });

export const paginationConfig = parsePaginationConfig(import.meta.env);
