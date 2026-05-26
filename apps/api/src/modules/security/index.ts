export {
  EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
  generateEmailChangeToken,
  hashEmailChangeToken,
} from './application/utils/email-change-token.util'

export { securityController } from './presentation/security.controller'
export { securityRoutes } from './presentation/security.routes'
export { default } from './presentation/security.routes'
export { securityService } from './security.service'

export type {
  SensitiveActionStepUpPayload,
  ChangeEmailPayload,
  VerifyEmailChangePayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  SecuritySession,
  SecurityOverview,
  VerifyTwoFactorSetupPayload,
  DisableTwoFactorPayload,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
  TwoFactorStatusResponse,
  EmailChangeRequestResponse,
  VerifyEmailChangeResponse,
  ChangePasswordResponse,
  SessionsResponse,
  RevokeSessionResponse,
  DisableTwoFactorResponse,
  DeleteAccountResponse,
} from './domain/types/security.types'

export {
  TWO_FACTOR_BACKUP_CODE_COUNT,
  generateBackupCodes,
  hashBackupCodes,
} from './application/utils/two-factor-backup-codes.util'

export {
  encryptTotpSecret,
  decryptTotpSecret,
} from './infrastructure/crypto/two-factor-secret.crypto'
