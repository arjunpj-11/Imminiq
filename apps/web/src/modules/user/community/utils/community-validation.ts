import type { VerificationVoteChoice } from '../types/community.types';

export const validateSearch = (value: string): string | undefined => {
  if (value.trim().length > 120) {
    return 'Search is too long.';
  }

  return undefined;
};

export const validateVoteReason = (value: string): string | undefined => {
  if (value.trim().length > 500) {
    return 'Reason must be 500 characters or less.';
  }

  return undefined;
};

export const isVerificationVoteChoice = (value: string): value is VerificationVoteChoice => {
  return value === 'pass' || value === 'fail';
};
