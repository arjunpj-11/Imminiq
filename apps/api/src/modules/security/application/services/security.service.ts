import { mongoSecurityRepository } from '../../infrastructure/repositories/mongo-security.repository'
import { securityEmailGateway } from '../../infrastructure/gateways/security-email.gateway'
import { securityPasswordGateway } from '../../infrastructure/gateways/security-password.gateway'
import { otplibTwoFactorGateway } from '../../infrastructure/gateways/otplib-two-factor.gateway'

import type {
  ChangeEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  DisableTwoFactorPayload,
  VerifyEmailChangePayload,
  VerifyTwoFactorSetupPayload,
} from '../../domain/types/security.types'

import { GetSecurityOverviewUseCase } from '../use-cases/get-security-overview.usecase'
import { RequestEmailChangeUseCase } from '../use-cases/request-email-change.usecase'
import { VerifyEmailChangeUseCase } from '../use-cases/verify-email-change.usecase'
import { ChangeSecurityPasswordUseCase } from '../use-cases/change-security-password.usecase'
import { GetSecuritySessionsUseCase } from '../use-cases/get-security-sessions.usecase'
import { RevokeSecuritySessionUseCase } from '../use-cases/revoke-security-session.usecase'
import { GetTwoFactorStatusUseCase } from '../use-cases/get-two-factor-status.usecase'
import { SetupTwoFactorUseCase } from '../use-cases/setup-two-factor.usecase'
import { VerifyTwoFactorSetupUseCase } from '../use-cases/verify-two-factor-setup.usecase'
import { DisableTwoFactorUseCase } from '../use-cases/disable-two-factor.usecase'
import { DeleteSecurityAccountUseCase } from '../use-cases/delete-security-account.usecase'

const getSecurityOverviewUseCase =
  new GetSecurityOverviewUseCase(mongoSecurityRepository)

const requestEmailChangeUseCase =
  new RequestEmailChangeUseCase(
    mongoSecurityRepository,
    securityEmailGateway
  )

const verifyEmailChangeUseCase =
  new VerifyEmailChangeUseCase(mongoSecurityRepository)

const changeSecurityPasswordUseCase =
  new ChangeSecurityPasswordUseCase(securityPasswordGateway)

const getSecuritySessionsUseCase =
  new GetSecuritySessionsUseCase(mongoSecurityRepository)

const revokeSecuritySessionUseCase =
  new RevokeSecuritySessionUseCase(mongoSecurityRepository)

const getTwoFactorStatusUseCase =
  new GetTwoFactorStatusUseCase(mongoSecurityRepository)

const setupTwoFactorUseCase =
  new SetupTwoFactorUseCase(
    mongoSecurityRepository,
    otplibTwoFactorGateway
  )

const verifyTwoFactorSetupUseCase =
  new VerifyTwoFactorSetupUseCase(
    mongoSecurityRepository,
    otplibTwoFactorGateway
  )

const disableTwoFactorUseCase =
  new DisableTwoFactorUseCase(
    mongoSecurityRepository,
    otplibTwoFactorGateway
  )

const deleteSecurityAccountUseCase =
  new DeleteSecurityAccountUseCase(mongoSecurityRepository)

export const securityService = {
  getOverview: async (
    userId: string,
    refreshToken?: string
  ) => {
    return getSecurityOverviewUseCase.execute(userId, refreshToken)
  },

  requestEmailChange: async (
    userId: string,
    payload: ChangeEmailPayload
  ) => {
    return requestEmailChangeUseCase.execute(userId, payload)
  },

  verifyEmailChange: async (
    payload: VerifyEmailChangePayload
  ) => {
    return verifyEmailChangeUseCase.execute(payload)
  },

  changePassword: async (
    userId: string,
    payload: ChangePasswordPayload
  ) => {
    return changeSecurityPasswordUseCase.execute(userId, payload)
  },

  getSessions: async (
    userId: string,
    refreshToken?: string
  ) => {
    return getSecuritySessionsUseCase.execute(userId, refreshToken)
  },

  revokeSession: async (
    userId: string,
    sessionId: string,
    refreshToken?: string
  ) => {
    return revokeSecuritySessionUseCase.execute(
      userId,
      sessionId,
      refreshToken
    )
  },

  getTwoFactorStatus: async (userId: string) => {
    return getTwoFactorStatusUseCase.execute(userId)
  },

  setupTwoFactor: async (userId: string) => {
    return setupTwoFactorUseCase.execute(userId)
  },

  verifyTwoFactorSetup: async (
    userId: string,
    payload: VerifyTwoFactorSetupPayload
  ) => {
    return verifyTwoFactorSetupUseCase.execute(userId, payload)
  },

  disableTwoFactor: async (
    userId: string,
    payload: DisableTwoFactorPayload
  ) => {
    return disableTwoFactorUseCase.execute(userId, payload)
  },

  deleteAccount: async (
    userId: string,
    payload: DeleteAccountPayload
  ) => {
    return deleteSecurityAccountUseCase.execute(userId, payload)
  },
}
