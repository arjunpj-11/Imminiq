import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IAuthNotification } from '../../domain/services/auth-notification.interface';
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface';

export interface IForgotPasswordUseCase {
  execute(identifier: string): Promise<void>;
}

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(
    private readonly _authRepository: IAuthUserRepository,
    private readonly _authNotification: IAuthNotification,
    private readonly _identifierNormalizer: IIdentifierNormalizer
  ) {}

  async execute(identifier: string): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier);

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value);

    if (!user) return;

    await this._authNotification.sendPasswordResetOtp({
      email: parsedIdentifier.email,
      phone: parsedIdentifier.phone,
    });
  }
}
