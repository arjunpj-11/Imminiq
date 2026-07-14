export type {
  ChangeEmailPayloadDTO,
  ChangePasswordPayloadDTO,
  ChangePasswordResponseDTO,
  DeleteAccountPayloadDTO,
  DeleteAccountResponseDTO,
  DisableTwoFactorPayloadDTO,
  DisableTwoFactorResponseDTO,
  EmailChangeRequestResponseDTO,
  RevokeSessionResponseDTO,
  SecurityOverviewDTO,
  SecuritySessionDTO,
  SensitiveActionStepUpPayloadDTO,
  TwoFactorSetupResponseDTO,
  TwoFactorVerifyResponseDTO,
  VerifyEmailChangePayloadDTO,
  VerifyEmailChangeResponseDTO,
  VerifyTwoFactorSetupPayloadDTO,
} from './application/security.dto';

export type { AuthProvider, TwoFactorStatus } from './domain/security.types';

export { createSecurityComposition } from './security.factory';
export { securityRoutes } from './presentation/security.routes';
