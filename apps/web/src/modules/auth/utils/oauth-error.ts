const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_state_invalid:
    'Your secure sign-in session expired or was replaced by another attempt. Please try again.',
  oauth_failed: 'Social sign-in could not be completed. Please try again.',
};

export const getOAuthErrorMessage = (errorCode: string | null): string | undefined =>
  errorCode ? OAUTH_ERROR_MESSAGES[errorCode] : undefined;
