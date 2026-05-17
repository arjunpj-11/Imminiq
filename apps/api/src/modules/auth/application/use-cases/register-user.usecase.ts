import bcrypt from 'bcryptjs'

import { authRepository } from '../../auth.repository'
import { ApiError } from '../../../../shared/utils/ApiError'
import { BCRYPT_ROUNDS } from '../../../../config/constants'
import type {
  AuthUser,
  RegisterPayload,
  VerificationMethod,
} from '../../domain/types/auth.types'
import { normalizeIdentifier } from '../services/identifier-normalizer.service'
import { sendVerificationOtp } from '../services/verification-otp.service'
import { generateRegistrationUsername } from '../services/username-generator.service'
import { formatAuthUser } from '../services/auth-user-formatter.service'

export class RegisterUserUseCase {
  async execute(payload: RegisterPayload): Promise<{
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }> {
    const { fullName, identifier, password } = payload

    const parsedIdentifier = normalizeIdentifier(identifier)

    if (parsedIdentifier.email) {
      const existingUser = await authRepository.findByEmail(
        parsedIdentifier.email
      )

      if (existingUser) {
        if (!existingUser.emailVerified) {
          await sendVerificationOtp({
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
      const existingUser = await authRepository.findByPhone(
        parsedIdentifier.phone
      )

      if (existingUser) {
        if (!existingUser.phoneVerified) {
          await sendVerificationOtp({
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
    })

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    const user = await authRepository.createUser({
      fullName,
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      username,
      passwordHash,
    })

    await sendVerificationOtp({
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
