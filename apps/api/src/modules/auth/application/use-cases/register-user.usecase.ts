import bcrypt from 'bcryptjs'

import { ApiError } from '../../../../shared/utils/ApiError'
import { BCRYPT_ROUNDS } from '../../../../config/constants'
import type { AuthRepositoryContract } from '../../domain/repositories/auth.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type {
  AuthUser,
  RegisterPayload,
  VerificationMethod,
} from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { generateRegistrationUsername } from '../services/username-generator.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract
  ) {}

  async execute(payload: RegisterPayload): Promise<{
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }> {
    const { fullName, identifier, password } = payload

    const parsedIdentifier = normalizeIdentifier(identifier)

    if (parsedIdentifier.email) {
      const existingUser = await this.authRepository.findByEmail(
        parsedIdentifier.email
      )

      if (existingUser) {
        if (!existingUser.emailVerified) {
          await this.authNotificationService.sendVerificationOtp({
            email: parsedIdentifier.email,
            method: 'email',
          })

          return {
            user: formatAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw new ApiError(409, 'Email already in use', 'EMAIL_TAKEN')
      }
    }

    if (parsedIdentifier.phone) {
      const existingUser = await this.authRepository.findByPhone(
        parsedIdentifier.phone
      )

      if (existingUser) {
        if (!existingUser.phoneVerified) {
          await this.authNotificationService.sendVerificationOtp({
            phone: parsedIdentifier.phone,
            method: 'phone',
          })

          return {
            user: formatAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw new ApiError(409, 'Phone already in use', 'PHONE_TAKEN')
      }
    }

    const username = await generateRegistrationUsername({
      email: parsedIdentifier.email,
      fullName,
    }, this.authRepository)

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const user = await this.authRepository.createUser({
      fullName,
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      username,
      passwordHash,
    })

    await this.authNotificationService.sendVerificationOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      method: parsedIdentifier.method,
    })

    return {
      user: formatAuthUser(user),
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    }
  }
}
