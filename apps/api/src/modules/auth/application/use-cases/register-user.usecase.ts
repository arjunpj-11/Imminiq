import { AuthApplicationError } from '../errors/auth-application.error'
import type { AuthUserRepositoryContract } from '../../domain/repositories/auth-user.repository.interface'
import type { AuthNotificationServiceContract } from '../../domain/services/auth-notification.service.interface'
import type { PasswordHasherServiceContract } from '../../domain/services/password-hasher.service.interface'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'
import type { RegisterPayload, AuthUser } from '../dtos/auth.dto'
import type { AuthUserMapperContract } from '../mappers/auth-user.mapper'
import type { IdentifierNormalizerContract } from '../../domain/services/identifier-normalizer.service.interface'
import type { UsernameGeneratorServiceContract } from '../services/username-generator.service'

export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthUserRepositoryContract,
    private readonly authNotificationService: AuthNotificationServiceContract,
    private readonly identifierNormalizer: IdentifierNormalizerContract,
    private readonly usernameGenerator: UsernameGeneratorServiceContract,
    private readonly passwordHasher: PasswordHasherServiceContract,
    private readonly authUserMapper: AuthUserMapperContract
  ) {}

  async execute(payload: RegisterPayload): Promise<{
    user: AuthUser
    verificationTarget: string
    verificationMethod: VerificationMethod
  }> {
    const { fullName, identifier, password } = payload

    const parsedIdentifier = this.identifierNormalizer.normalize(identifier)

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
            user: this.authUserMapper.toAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw AuthApplicationError.emailTaken('Email already in use')
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
            user: this.authUserMapper.toAuthUser(existingUser),
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          }
        }

        throw AuthApplicationError.phoneTaken('Phone already in use')
      }
    }

    const username = await this.usernameGenerator.generateRegistrationUsername({
      email: parsedIdentifier.email,
      fullName,
    })

    const passwordHash = await this.passwordHasher.hash(password)

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
      user: this.authUserMapper.toAuthUser(user),
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    }
  }
}
