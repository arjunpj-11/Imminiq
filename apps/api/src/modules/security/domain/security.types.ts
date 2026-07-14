export type AuthProvider = 'local' | 'google' | 'github';
export type TwoFactorStatus = 'not_configured' | 'pending' | 'active' | 'disabled';
export type SensitiveSecurityAction = 'change_email' | 'delete_account';
export type SecurityAttemptScope = 'security_two_factor_setup' | 'security_two_factor_disable';
export type SecurityAttemptPolicyName = 'twoFactorVerification';
export type SecurityAuditEventType =
  | 'SENSITIVE_ACTION_PASSWORD_REAUTH_FAILED'
  | 'SENSITIVE_ACTION_TWO_FACTOR_REAUTH_FAILED'
  | 'EMAIL_CHANGE_REQUESTED'
  | 'EMAIL_CHANGE_VERIFIED'
  | 'ACCOUNT_DELETION_SCHEDULED';
export type SecurityAuditOutcome = 'success' | 'failure';
export type TwoFactorBackupCodeRecord = {
  codeHash: string;
  usedAt: null;
};
