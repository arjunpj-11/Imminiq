import { describe, expect, it } from 'vitest';

import { getOAuthErrorMessage } from '../../../../src/modules/auth/utils/oauth-error';

describe('OAuth error messages', () => {
  it('explains an invalid state without exposing security details', () => {
    expect(getOAuthErrorMessage('oauth_state_invalid')).toBe(
      'Your secure sign-in session expired or was replaced by another attempt. Please try again.'
    );
  });

  it('does not render unknown callback codes', () => {
    expect(getOAuthErrorMessage('unexpected_internal_code')).toBeUndefined();
    expect(getOAuthErrorMessage(null)).toBeUndefined();
  });
});
