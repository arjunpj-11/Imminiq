import type { MongoDuplicateKeyError } from './mongo-chat.types';

export const isMongoDuplicateKeyError = (error: unknown): error is MongoDuplicateKeyError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: unknown }).code === 11000;
