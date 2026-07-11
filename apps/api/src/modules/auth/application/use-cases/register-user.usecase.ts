import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationContract } from '../../domain/services/auth-notification.interface'
import type { PasswordHasherContract } from '../../domain/services/password-hasher.interface'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'
import type { RegisterPayload, AuthUser } from '../dtos/auth.dto'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.interface'
import type { UsernameGeneratorContract } from '../services/username-generator.service'

export class RegisterUserUseCase {
  constructor(
    private readonly _authRepository: AuthUserRepositoryContract,
    private readonly _authNotification: AuthNotificationContract,
    private readonly _identifierNormalizer: IdentifierNormalizerContract,
    private readonly _usernameGenerator: UsernameGeneratorContract,
    private readonly _passwordHasher: PasswordHasherContract,
    private readonly _authUserMapper: AuthUserMapperContract
  ) {}

  async execute(payload: RegisterPayload): Promise<{
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }> {
    const { fullName, identifier, password } = payload

    const parsedIdentifier = this._identifierNormalizer.normalize(identifier)

    if (parsedIdentifier.email) {
      const existingUser = await this._authRepository.findByEmail(
        parsedIdentifier.email
      )

      if (existingUser) {
        if (!existingUser.emailVerified) {
          await this._authNotification.sendVerificationOtp({
            email: parsedIdentifier.email,
            method: 'email',
          })

          return {
            user: this._authUserMapper.toAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw AuthApplicationError.emailTaken('Email already in use')
      }
    }

    if (parsedIdentifier.phone) {
      const existingUser = await this._authRepository.findByPhone(
        parsedIdentifier.phone
      )

      if (existingUser) {
        if (!existingUser.phoneVerified) {
          await this._authNotification.sendVerificationOtp({
            phone: parsedIdentifier.phone,
            method: 'phone',
          })

          return {
            user: this._authUserMapper.toAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw AuthApplicationError.phoneTaken('Phone already in use')
      }
    }

    const username = await this._usernameGenerator.generateRegistrationUsername({
      email: parsedIdentifier.email,
      fullName,
    })

    const passwordHash = await this._passwordHasher.hash(password)

    const user = await this._authRepository.createUser({
      fullName,
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      username,
      passwordHash,
    })

    await this._authNotification.sendVerificationOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
      method: parsedIdentifier.method,
    })

    return {
      user: this._authUserMapper.toAuthUser(user),
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    }
  }
}
