import type { AuthRole } from '../domain/value-objects/auth-role.vo';
import type { UserStatus } from '../domain/value-objects/user-status.vo';
import type { VerificationMethod } from '../domain/value-objects/verification-method.vo';
import type { LoginRedirectPath } from '../domain/value-objects/login-redirect-path.vo';

export interface RegisterPayloadDTO {
  fullName: string;
  identifier: string;
  password: string;
}

export interface LoginPayloadDTO {
  identifier: string;
  password: string;
}

export interface TwoFactorLoginVerifyPayloadDTO {
  code: string;
}

export interface TokenPairDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserDTO {
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

export interface AuthSessionDTO {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  device?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string | null;
}

export interface AuthLoginSuccessResultDTO {
  requiresTwoFactor: false;
  tokens: TokenPairDTO;
  user: AuthUserDTO;
  redirectPath: LoginRedirectPath;
}

export interface AuthTwoFactorChallengeResultDTO {
  requiresTwoFactor: true;
  challengeToken: string;
  challengeExpiresInMinutes: number;
}

export type AuthLoginResultDTO = AuthLoginSuccessResultDTO | AuthTwoFactorChallengeResultDTO;

export interface AuthResponseDTO {
  success: boolean;
  message: string;
  data:
    | {
        accessToken: string;
        user: AuthUserDTO;
        redirectPath: LoginRedirectPath;
      }
    | {
        requiresTwoFactor: true;
        challengeExpiresInMinutes: number;
      };
}

export interface RegisterResponseDTO {
  success: boolean;
  message: string;
  data: {
    verificationTarget: string;
    verificationMethod: VerificationMethod;
  };
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
