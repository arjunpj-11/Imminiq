export { securityService } from './security.service'
export type { SecurityService } from './security.service'

export type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  ChangePasswordResponseDto,
  DeleteAccountPayload,
  DeleteAccountResponseDto,
  DisableTwoFactorPayload,
  DisableTwoFactorResponseDto,
  EmailChangeRequestResponseDto,
  RevokeSessionResponseDto,
  SecurityOverviewDto,
  SecuritySessionDto,
  SensitiveActionStepUpPayload,
  SessionsResponseDto,
  TwoFactorSetupResponseDto,
  TwoFactorStatusResponseDto,
  TwoFactorVerifyResponseDto,
  VerifyEmailChangePayload,
  VerifyEmailChangeResponseDto,
  VerifyTwoFactorSetupPayload,
} from './application/dtos/security.dto'

export type {
  AuthProvider,
  TwoFactorStatus,
} from './domain/types/security.types'
