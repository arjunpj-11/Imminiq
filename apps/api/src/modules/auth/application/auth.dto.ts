import type { AuthRole } from '../domain/value-objects/auth-role.vo';
import type { UserStatus } from '../domain/value-objects/user-status.vo';
import type { VerificationMethod } from '../domain/value-objects/verification-method.vo';
import type { LoginRedirectPath } from '../domain/value-objects/login-redirect-path.vo';

export interface IRegisterPayloadDTO {
  fullName: string;
  identifier: string;
  password: string;
}

export interface ILoginPayloadDTO {
  identifier: string;
  password: string;
}

export interface ITwoFactorLoginVerifyPayloadDTO {
  code: string;
}

export interface ITokenPairDTO {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthUserDTO {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium: boolean;
  avatarUrl?: string | null;
  onboardingCompleted: boolean;
}

export interface IAuthSessionDTO {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | null;
}

export interface IAuthLoginSuccessResultDTO {
  requiresTwoFactor: false;
  tokens: ITokenPairDTO;
  user: IAuthUserDTO;
  redirectPath: LoginRedirectPath;
}

export interface IAuthTwoFactorChallengeResultDTO {
  requiresTwoFactor: true;
  challengeToken: string;
  challengeExpiresInMinutes: number;
}

export type AuthLoginResultDTO = IAuthLoginSuccessResultDTO | IAuthTwoFactorChallengeResultDTO;

export interface IAuthResponseDTO {
  success: boolean;
  message: string;
  data:
    | {
        accessToken: string;
        user: IAuthUserDTO;
        redirectPath: LoginRedirectPath;
      }
    | {
        requiresTwoFactor: true;
        challengeExpiresInMinutes: number;
      };
}

export interface IRegisterResponseDTO {
  success: boolean;
  message: string;
  data: {
    verificationTarget: string;
    verificationMethod: VerificationMethod;
  };
}

export interface IApiErrorResponseDTO {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type RequestMetaDTO = {
  device?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type OAuthLoginUserDTO = {
  id?: string;
  _id?: string | { toString(): string };
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium: boolean;
  avatarUrl?: string | null;
  onboardingCompleted: boolean;
};
