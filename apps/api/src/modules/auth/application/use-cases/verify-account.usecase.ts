import { AuthApplicationError } from '../auth-application.error';
import type { IAuthUserRepository } from '../../domain/repositories/auth-user.repository.interface';
import type { IPhoneOtpProvider } from '../../domain/services/phone-otp-provider.interface';
import type { IPhoneOtpSessionStore } from '../../domain/services/phone-otp-session-store.interface';
import type { ISecurityAttemptStore } from '../../domain/services/security-attempt-store.interface';
import type { IOtpStore } from '../../domain/services/otp-store.interface';
import type { IIdentifierNormalizer } from '../../domain/services/identifier-normalizer.interface';
import type {
  IPendingRegistrationStore,
  PendingRegistration,
} from '../../domain/services/pending-registration-store.interface';
import type { IUsernameGenerator } from '../services/username-generator.service';
import type { VerificationMethod } from '../../domain/value-objects/verification-method.vo';

const VERIFY_ACCOUNT_SCOPE = 'auth_verify_account_otp' as const;

export interface IVerifyAccountUseCase {
  execute(identifier: string, otp: string): Promise<void>;
}

export class VerifyAccountUseCase implements IVerifyAccountUseCase {
  constructor(
    private readonly _authRepository: Pick<
      IAuthUserRepository,
      'findByIdentifier' | 'markEmailVerified' | 'markPhoneVerified' | 'createUser'
    >,
    private readonly _identifierNormalizer: IIdentifierNormalizer,
    private readonly _securityAttemptStore: ISecurityAttemptStore,
    private readonly _phoneOtpProvider: IPhoneOtpProvider,
    private readonly _phoneOtpSessionStore: IPhoneOtpSessionStore,
    private readonly _otpStore: IOtpStore,
    private readonly _pendingRegistrationStore: IPendingRegistrationStore,
    private readonly _usernameGenerator: IUsernameGenerator
  ) {}

  async execute(identifier: string, otp: string): Promise<void> {
    const parsedIdentifier = this._identifierNormalizer.normalize(identifier);

    await this.assertOtpVerificationAllowed(parsedIdentifier.value);

    const user = await this._authRepository.findByIdentifier(parsedIdentifier.value);
    const pendingRegistration = user
      ? null
      : await this._pendingRegistrationStore.get(parsedIdentifier.value);

    if (
      !user &&
      !this.matchesIdentifier(pendingRegistration, parsedIdentifier.method, parsedIdentifier.value)
    ) {
      await this.recordInvalidOtpAttempt(parsedIdentifier.value);

      throw AuthApplicationError.invalidOtp('Invalid or expired OTP');
    }

    if (parsedIdentifier.method === 'email') {
      const valid = await this._otpStore.verifyOtp({
        email: parsedIdentifier.email,
        otp,
        purpose: 'email_verification',
      });

      if (!valid) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value);

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP');
      }

      if (user?.emailVerified) {
        throw AuthApplicationError.emailAlreadyVerified('Email is already verified');
      }

      if (user) {
        await this._authRepository.markEmailVerified(user.id);
      } else {
        await this.createVerifiedUser(pendingRegistration!, 'email');
        await this._pendingRegistrationStore.delete(parsedIdentifier.value);
      }

      await this._securityAttemptStore.clear(VERIFY_ACCOUNT_SCOPE, parsedIdentifier.value);

      return;
    }

    if (parsedIdentifier.method === 'phone') {
      const verificationId = await this._phoneOtpSessionStore.getVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      );

      if (!verificationId) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value);

        throw AuthApplicationError.otpSessionExpired(
          'OTP session expired. Please request a new OTP.'
        );
      }

      const valid = await this._phoneOtpProvider.verifyOtp(verificationId, otp);

      if (!valid) {
        await this.recordInvalidOtpAttempt(parsedIdentifier.value);

        throw AuthApplicationError.invalidOtp('Invalid or expired OTP');
      }

      if (user?.phoneVerified) {
        throw AuthApplicationError.phoneAlreadyVerified('Phone is already verified');
      }

      if (user) {
        await this._authRepository.markPhoneVerified(user.id);
      } else {
        await this.createVerifiedUser(pendingRegistration!, 'phone');
        await this._pendingRegistrationStore.delete(parsedIdentifier.value);
      }

      await this._securityAttemptStore.clear(VERIFY_ACCOUNT_SCOPE, parsedIdentifier.value);

      await this._phoneOtpSessionStore.deleteVerificationId(
        parsedIdentifier.phone!,
        'phone_verification'
      );
    }
  }

  private matchesIdentifier(
    registration: PendingRegistration | null,
    method: VerificationMethod,
    identifier: string
  ): registration is PendingRegistration {
    if (!registration) return false;

    return method === 'email'
      ? registration.email === identifier
      : registration.phone === identifier;
  }

  private async createVerifiedUser(
    registration: PendingRegistration,
    method: VerificationMethod
  ): Promise<void> {
    const username = await this._usernameGenerator.generateRegistrationUsername({
      email: registration.email,
      fullName: registration.fullName,
    });

    await this._authRepository.createUser({
      ...registration,
      username,
      emailVerified: method === 'email',
      phoneVerified: method === 'phone',
    });
  }

  private async assertOtpVerificationAllowed(identifier: string): Promise<void> {
    const blocked = await this._securityAttemptStore.isBlocked(VERIFY_ACCOUNT_SCOPE, identifier);

    if (!blocked) return;

    throw AuthApplicationError.otpVerificationTemporarilyBlocked(
      'Too many invalid verification attempts. Request a new OTP or try again later.'
    );
  }

  private async recordInvalidOtpAttempt(identifier: string): Promise<void> {
    const result = await this._securityAttemptStore.recordFailure(
      VERIFY_ACCOUNT_SCOPE,
      identifier,
      'otpVerification'
    );

    if (result.blocked) {
      throw AuthApplicationError.otpVerificationTemporarilyBlocked(
        'Too many invalid verification attempts. Request a new OTP or try again later.'
      );
    }
  }
}
