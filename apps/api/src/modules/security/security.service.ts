// apps/api/src/modules/security/security.service.ts

import * as QRCode from 'qrcode'
import {
  generateSecret,
  generateURI,
  verify,
} from 'otplib'

import { ApiError } from '../../shared/utils/ApiError'
import { sendMail } from '../../infrastructure/email/email.client'
import {
  emailChangeAlertTemplate,
  emailChangeVerificationTemplate,
} from '../../shared/email/email.templates'
import { env } from '../../config/env'
import { authService } from '../auth/auth.service'
import { securityRepository } from './security.repository'

import {
  EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
  generateEmailChangeToken,
  hashEmailChangeToken,
} from './email-change-token.util'

import {
  decryptTotpSecret,
  encryptTotpSecret,
} from './two-factor-secret.util'

import {
  generateBackupCodes,
  hashBackupCodes,
} from './two-factor-backup-codes.util'

import type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  DisableTwoFactorPayload,
  SecurityOverview,
  SecuritySession,
  VerifyEmailChangePayload,
  VerifyTwoFactorSetupPayload,
} from './security.types'

const TWO_FACTOR_ISSUER = 'Imminiq'

type ActiveSessionDocument = Awaited<
  ReturnType<typeof securityRepository.findActiveSessions>
>[number]

const formatSessionDate = (date?: Date | null): string => {
  if (!date) {
    return 'Unknown'
  }

  return date.toISOString()
}

const mapSession = (
  session: ActiveSessionDocument,
  currentSessionId?: string | null
): SecuritySession => {
  const sessionId = String(session._id)

  return {
    id: sessionId,
    deviceName: session.device ?? 'Unknown device',
    location: session.ipAddress ?? 'Unknown location',
    client: session.userAgent ?? 'Unknown client',
   lastActive: formatSessionDate(session.updatedAt),
    current: currentSessionId === sessionId,
  }
}

const getCurrentSessionId = async (
  refreshToken?: string
): Promise<string | null> => {
  if (!refreshToken) {
    return null
  }

  const currentTokenRecord =
    await securityRepository.findCurrentRefreshTokenRecord(refreshToken)

  if (!currentTokenRecord) {
    return null
  }

  return String(currentTokenRecord._id)
}

export const securityService = {
  // ─── OVERVIEW ─────────────────────────────────────

  getOverview: async (
    userId: string,
    refreshToken?: string
  ): Promise<SecurityOverview> => {
    const user = await securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const sessions = await securityRepository.findActiveSessions(userId)
    const currentSessionId = await getCurrentSessionId(refreshToken)
    const twoFactor = await securityRepository.findTwoFactorByUserId(userId)

    return {
      email: user.email ?? '',
      emailVerified: user.emailVerified,
      pendingEmail: user.pendingEmail ?? null,

      authProvider: user.provider,
      canChangePassword: user.provider === 'local',

      twoFactorEnabled: twoFactor?.status === 'active',
      activeSessions: sessions.map((session) =>
        mapSession(session, currentSessionId)
      ),
      passwordLastChangedAt: null,
    }
  },

  // ─── REQUEST EMAIL CHANGE ─────────────────────────

  requestEmailChange: async (
    userId: string,
    payload: ChangeEmailPayload
  ) => {
    const user = await securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const normalizedEmail = payload.newEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      throw new ApiError(
        400,
        'New email is required',
        'EMAIL_REQUIRED'
      )
    }

    if (user.email?.trim().toLowerCase() === normalizedEmail) {
      throw new ApiError(
        400,
        'New email must be different from current email',
        'EMAIL_UNCHANGED'
      )
    }

    const emailAlreadyUsed =
      await securityRepository.emailExists(normalizedEmail)

    if (emailAlreadyUsed) {
      throw new ApiError(
        409,
        'Email is already in use',
        'EMAIL_TAKEN'
      )
    }

    const {
      rawToken,
      tokenHash,
      expiresAt,
    } = generateEmailChangeToken()

    const updatedUser =
      await securityRepository.savePendingEmailChange(userId, {
        pendingEmail: normalizedEmail,
        tokenHash,
        expiresAt,
      })

    if (!updatedUser) {
      throw new ApiError(
        500,
        'Failed to create email change request',
        'EMAIL_CHANGE_REQUEST_FAILED'
      )
    }

    const verificationUrl =
      `${env.CLIENT_URL}/verify-email-change?token=${rawToken}`

    await sendMail(
      normalizedEmail,
      'Verify your new Imminiq email address',
      emailChangeVerificationTemplate({
        fullName: user.fullName,
        newEmail: normalizedEmail,
        verificationUrl,
        expiresMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
      })
    )

    if (user.email) {
      await sendMail(
        user.email,
        'Imminiq email change requested',
        emailChangeAlertTemplate({
          fullName: user.fullName,
          requestedNewEmail: normalizedEmail,
        })
      )
    }

    return {
      pendingEmail: normalizedEmail,
      verificationSent: true,
      expiresInMinutes: EMAIL_CHANGE_TOKEN_EXPIRES_MINUTES,
    }
  },

  // ─── VERIFY EMAIL CHANGE LINK ─────────────────────

  verifyEmailChange: async (
    payload: VerifyEmailChangePayload
  ) => {
    const tokenHash = hashEmailChangeToken(payload.token)

    const user =
      await securityRepository.findUserByPendingEmailTokenHash(tokenHash)

    if (!user || !user.pendingEmail) {
      throw new ApiError(
        400,
        'This email verification link is invalid or expired',
        'EMAIL_CHANGE_LINK_INVALID'
      )
    }

    const pendingEmail = user.pendingEmail.trim().toLowerCase()

    const emailAlreadyUsed =
      await securityRepository.emailExists(pendingEmail)

    if (
      emailAlreadyUsed &&
      user.email?.trim().toLowerCase() !== pendingEmail
    ) {
      await securityRepository.clearPendingEmailChange(String(user._id))

      throw new ApiError(
        409,
        'That email is no longer available',
        'EMAIL_TAKEN'
      )
    }

    const updatedUser =
      await securityRepository.confirmPendingEmailChange(
        String(user._id),
        pendingEmail
      )

    if (!updatedUser) {
      throw new ApiError(
        500,
        'Failed to verify email change',
        'EMAIL_CHANGE_VERIFY_FAILED'
      )
    }

    await securityRepository.revokeAllSessions(String(user._id))

    return {
      email: updatedUser.email ?? pendingEmail,
      emailVerified: updatedUser.emailVerified,
      verified: true,
      sessionsRevoked: true,
    }
  },

  // ─── CHANGE PASSWORD ──────────────────────────────

  changePassword: async (
    userId: string,
    payload: ChangePasswordPayload
  ) => {
    await authService.changePassword(
      userId,
      payload.currentPassword,
      payload.newPassword
    )

    return {
      sessionsRevoked: true,
    }
  },

  // ─── GET SESSIONS ─────────────────────────────────

  getSessions: async (
    userId: string,
    refreshToken?: string
  ) => {
    const sessions = await securityRepository.findActiveSessions(userId)
    const currentSessionId = await getCurrentSessionId(refreshToken)

    return {
      activeSessions: sessions.map((session) =>
        mapSession(session, currentSessionId)
      ),
    }
  },

  // ─── REVOKE SESSION ───────────────────────────────

  revokeSession: async (
    userId: string,
    sessionId: string,
    refreshToken?: string
  ) => {
    const currentSessionId = await getCurrentSessionId(refreshToken)

    if (currentSessionId === sessionId) {
      throw new ApiError(
        403,
        'Use logout to end your current session',
        'CANNOT_REVOKE_CURRENT_SESSION'
      )
    }

    const revokedSession =
      await securityRepository.revokeSessionById(userId, sessionId)

    if (!revokedSession) {
      throw new ApiError(
        404,
        'Session not found',
        'SESSION_NOT_FOUND'
      )
    }

    return {
      revoked: true,
      sessionId,
    }
  },

  // ─── 2FA STATUS ───────────────────────────────────

  getTwoFactorStatus: async (userId: string) => {
    const twoFactor = await securityRepository.findTwoFactorByUserId(userId)

    if (!twoFactor) {
      return {
        enabled: false,
        status: 'not_configured' as const,
      }
    }

    return {
      enabled: twoFactor.status === 'active',
      status: twoFactor.status,
    }
  },

  // ─── 2FA SETUP ────────────────────────────────────

  setupTwoFactor: async (userId: string) => {
    const user = await securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    const existingTwoFactor =
      await securityRepository.findTwoFactorByUserId(userId)

    if (existingTwoFactor?.status === 'active') {
      throw new ApiError(
        409,
        'Two-factor authentication is already enabled',
        'TWO_FACTOR_ALREADY_ENABLED'
      )
    }

    const secret = generateSecret()

    const accountLabel =
      user.email?.trim().toLowerCase() || user.username

    const qrCodeUri = generateURI({
      issuer: TWO_FACTOR_ISSUER,
      label: accountLabel,
      secret,
    })

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUri)

    const encryptedSecret = encryptTotpSecret(secret)

    const setupRecord =
      await securityRepository.savePendingTwoFactorSetup(userId, {
        encryptedSecret,
        issuer: TWO_FACTOR_ISSUER,
        accountLabel,
        qrCodeUri,
      })

    if (!setupRecord) {
      throw new ApiError(
        500,
        'Unable to start two-factor setup',
        'TWO_FACTOR_SETUP_FAILED'
      )
    }

    return {
      qrCodeDataUrl,
      manualEntryKey: secret,
      issuer: TWO_FACTOR_ISSUER,
      accountLabel,
    }
  },

  // ─── 2FA VERIFY SETUP ─────────────────────────────

  verifyTwoFactorSetup: async (
    userId: string,
    payload: VerifyTwoFactorSetupPayload
  ) => {
    const twoFactor =
      await securityRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor) {
      throw new ApiError(
        404,
        'Two-factor setup was not found',
        'TWO_FACTOR_SETUP_NOT_FOUND'
      )
    }

    if (twoFactor.status === 'active') {
      throw new ApiError(
        409,
        'Two-factor authentication is already enabled',
        'TWO_FACTOR_ALREADY_ENABLED'
      )
    }

    if (twoFactor.status !== 'pending') {
      throw new ApiError(
        400,
        'Start two-factor setup again before verifying',
        'TWO_FACTOR_SETUP_NOT_PENDING'
      )
    }

    const secret = decryptTotpSecret(twoFactor.totpSecretEncrypted)

    const verification = await verify({
      secret,
      token: payload.token,
    })

    if (!verification.valid) {
      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = await hashBackupCodes(backupCodes)

    const activatedTwoFactor =
      await securityRepository.activateTwoFactor(
        userId,
        hashedBackupCodes
      )

    if (!activatedTwoFactor) {
      throw new ApiError(
        500,
        'Unable to enable two-factor authentication',
        'TWO_FACTOR_ENABLE_FAILED'
      )
    }

    return {
      enabled: true,
      backupCodes,
    }
  },

  // ─── 2FA DISABLE ──────────────────────────────────

  disableTwoFactor: async (
    userId: string,
    payload: DisableTwoFactorPayload
  ) => {
    const twoFactor =
      await securityRepository.findTwoFactorWithSecret(userId)

    if (!twoFactor || twoFactor.status !== 'active') {
      throw new ApiError(
        400,
        'Two-factor authentication is not enabled',
        'TWO_FACTOR_NOT_ENABLED'
      )
    }

    const secret = decryptTotpSecret(twoFactor.totpSecretEncrypted)

    const verification = await verify({
      secret,
      token: payload.token,
    })

    if (!verification.valid) {
      throw new ApiError(
        400,
        'Invalid authenticator code',
        'INVALID_TWO_FACTOR_CODE'
      )
    }

    const disabledTwoFactor =
      await securityRepository.disableTwoFactor(userId)

    if (!disabledTwoFactor) {
      throw new ApiError(
        500,
        'Unable to disable two-factor authentication',
        'TWO_FACTOR_DISABLE_FAILED'
      )
    }

    return {
      disabled: true,
    }
  },

  // ─── DELETE ACCOUNT ───────────────────────────────

  deleteAccount: async (
    userId: string,
    payload: DeleteAccountPayload
  ) => {
    if (payload.confirmation !== 'DELETE') {
      throw new ApiError(
        400,
        'Type DELETE to confirm account deletion',
        'INVALID_DELETE_CONFIRMATION'
      )
    }

    const user = await securityRepository.findUserById(userId)

    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND')
    }

    await securityRepository.revokeAllSessions(userId)

    const deletedUser =
      await securityRepository.softDeleteAccount(userId)

    if (!deletedUser) {
      throw new ApiError(
        500,
        'Failed to delete account',
        'ACCOUNT_DELETE_FAILED'
      )
    }

    return {
      deleted: true,
    }
  },
}