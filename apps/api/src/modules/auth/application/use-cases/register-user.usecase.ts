import { AuthApplicationError } from '../errors/auth-application.error'
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface'
import type { IAuthNotification } from '../../domain/services/auth-notification.interface'
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface'
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo'
import type { IRegisterPayloadDTO, IAuthUserDTO } from '../dtos/auth.dto'
import type { IAuthUserMapper } from '../mappers/auth-user.mapper'
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface'
import type { IUsernameGenerator } from '../services/username-generator.service'

export class RegisterUserUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _authNotification: IAuthNotification,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _usernameGenerator: IUsernameGenerator,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _authUserMapper: IAuthUserMapper
  ) {}

  async execute(payload: IRegisterPayloadDTO): Promise<{
    user: IAuthUserDTO
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
