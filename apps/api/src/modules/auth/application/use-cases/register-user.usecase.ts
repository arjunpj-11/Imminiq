import { AuthApplicationError } from '../auth-application.error';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthNotification } from '../../domain/services/auth-notification.interface';
import type { IPasswordHasher } from '../../domain/services/password-hasher.interface';
import type { IPendingRegistrationStore } from '../../domain/services/pending-registration-store.interface';
import type { RegisterPayloadDTO, RegisterResultDTO } from '../auth.dto';
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface';
import type { AuthRuntimePolicy } from '../../domain/auth-runtime-policy';

export interface IRegisterUserUseCase {
  execute(payload: RegisterPayloadDTO): Promise<RegisterResultDTO>;
}

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    private readonly _authRepository: Pick<IAuthUserRepository, 'findByEmail' | 'findByPhone'>,
    private readonly _authNotification: IAuthNotification,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _passwordHasher: IPasswordHasher,
    private readonly _pendingRegistrationStore: IPendingRegistrationStore,
    private readonly _runtimePolicy: Pick<AuthRuntimePolicy, 'pendingRegistrationTtlSeconds'>
  ) {}

  async execute(payload: RegisterPayloadDTO): Promise<RegisterResultDTO> {
    const { fullName, identifier, password } = payload;

    const parsedIdentifier = this._identifierNormalizer.normalize(identifier);

    if (parsedIdentifier.email) {
      const existingUser = await this._authRepository.findByEmail(parsedIdentifier.email);

      if (existingUser) {
        if (!existingUser.emailVerified) {
          await this._authNotification.sendVerificationOtp({
            email: parsedIdentifier.email,
            method: 'email',
          });

          return {
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          };
        }

        throw AuthApplicationError.emailTaken('Email already in use');
      }
    }

    if (parsedIdentifier.phone) {
      const existingUser = await this._authRepository.findByPhone(parsedIdentifier.phone);

      if (existingUser) {
        if (!existingUser.phoneVerified) {
          await this._authNotification.sendVerificationOtp({
            phone: parsedIdentifier.phone,
            method: 'phone',
          });

          return {
            verificationTarget: parsedIdentifier.value,
            verificationMethod: parsedIdentifier.method,
          };
        }

        throw AuthApplicationError.phoneTaken('Phone already in use');
      }
    }

    const passwordHash = await this._passwordHasher.hash(password);

    await this._pendingRegistrationStore.save(
      parsedIdentifier.value,
      {
        fullName,
        email: parsedIdentifier.email,
        phone: parsedIdentifier.phone,
        passwordHash,
      },
      this._runtimePolicy.pendingRegistrationTtlSeconds
    );

    try {
      await this._authNotification.sendVerificationOtp({
        email: parsedIdentifier.email,
        phone: parsedIdentifier.phone,
        method: parsedIdentifier.method,
      });
    } catch (error) {
      await this._pendingRegistrationStore.delete(parsedIdentifier.value);
      throw error;
    }

    return {
      verificationTarget: parsedIdentifier.value,
      verificationMethod: parsedIdentifier.method,
    };
  }
}
