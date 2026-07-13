export type SecurityAttemptScope =
  'auth_login' | 'auth_verify_account_otp' | 'auth_verify_reset_otp' | 'auth_two_factor_login';

export type SecurityAttemptPolicyName = 'authLogin' | 'otpVerification' | 'twoFactorVerification';

export interface ISecurityAttemptStore {
  isBlocked(scope: SecurityAttemptScope, identifier: string): Promise<boolean>;

  getRetryAfterSeconds(scope: SecurityAttemptScope, identifier: string): Promise<number>;

  recordFailure(
    scope: SecurityAttemptScope,
    identifier: string,
    policyName: SecurityAttemptPolicyName
  ): Promise<{
    blocked: boolean;
  }>;

  clear(scope: SecurityAttemptScope, identifier: string): Promise<void>;
}
