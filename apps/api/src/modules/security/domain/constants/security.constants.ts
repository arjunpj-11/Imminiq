export const EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES = 10
export const TWO_FACTOR_BACKUP_CODE_COUNT = 8
export const TWO_FACTOR_ISSUER = 'Imminiq'
export const ACCOUNT_DELETION_RECOVERY_DAYS = 30
export const ACCOUNT_DELETION_RECOVERY_MS =
  ACCOUNT_DELETION_RECOVERY_DAYS * 24 * 60 * 60 * 1000
export const TWO_FACTOR_SETUP_ATTEMPT_SCOPE =
  'security_two_factor_setup' as const
export const TWO_FACTOR_DISABLE_ATTEMPT_SCOPE =
  'security_two_factor_disable' as const
