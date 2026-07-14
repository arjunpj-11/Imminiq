import { verify } from 'otplib';

import { decryptTotpSecret } from '../../../../infrastructure/security/two-factor-secret.crypto';
import type { ITwoFactorCodeVerifier } from '../../domain/services/two-factor-code-verifier.interface';

export class OtplibTwoFactorCodeVerifier implements ITwoFactorCodeVerifier {
  async verifyTotp(data: { encryptedSecret: string; token: string }): Promise<boolean> {
    const secret = decryptTotpSecret(data.encryptedSecret);

    const result = await verify({
      secret,
      token: data.token,
    });

    return result.valid;
  }
}

export const otplibTwoFactorCodeVerifier = new OtplibTwoFactorCodeVerifier();
