const restrictedAccountCodes = new Set([
  'ACCOUNT_BLOCKED',
  'ACCOUNT_BANNED',
  'ACCOUNT_DEACTIVATED',
  'ACCOUNT_PAUSED',
]);

export const getAuthErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = error as { code?: unknown; errorCode?: unknown };

  if (typeof candidate.code === 'string') return candidate.code;
  return typeof candidate.errorCode === 'string' ? candidate.errorCode : undefined;
};

export const isRestrictedAccountCode = (code?: string): boolean =>
  code !== undefined && restrictedAccountCodes.has(code);

export const buildOAuthFailureRedirectUrl = (clientUrl: string, code?: string): string => {
  const searchParams = new URLSearchParams({ error: 'oauth_failed' });

  if (code && /^[A-Z0-9_]+$/.test(code)) {
    searchParams.set('code', code);
  }

  return `${clientUrl}/login?${searchParams.toString()}`;
};
