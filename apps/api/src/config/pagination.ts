import { env } from './env';

export const paginationConfig = Object.freeze({
  defaultLimit: env.PAGINATION_DEFAULT_LIMIT,
  profileLimit: env.PAGINATION_PROFILE_LIMIT,
  gridLimit: env.PAGINATION_GRID_LIMIT,
  adminLimit: env.PAGINATION_ADMIN_LIMIT,
  batchLimit: env.PAGINATION_BATCH_LIMIT,
  messageLimit: env.PAGINATION_MESSAGE_LIMIT,
  maxStandardLimit: env.PAGINATION_MAX_STANDARD_LIMIT,
  maxLimit: env.PAGINATION_MAX_LIMIT,
});
