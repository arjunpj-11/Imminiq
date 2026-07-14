export type {
  AuthLoginResultDTO,
  IAuthSessionDTO,
  IAuthLoginSuccessResultDTO,
  IAuthUserDTO,
  ILoginPayloadDTO,
  OAuthLoginUserDTO,
  IRegisterPayloadDTO,
  RequestMetaDTO,
  ITokenPairDTO,
  ITwoFactorLoginVerifyPayloadDTO,
} from './application/auth.dto';

export type {
  AuthRole,
  LoginRedirectPath,
  OAuthProvider,
  OtpPurpose,
  UserStatus,
  VerificationMethod,
} from './domain/auth.types';

export type { IAuthRepository } from './domain/repositories/auth.repository.interface';

export { createAuthComposition } from './auth.factory';
export { createAuthRoutes } from './presentation/auth.routes';
