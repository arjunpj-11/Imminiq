import { env } from '../../../../config/env';
import type { ISecurityEmailChangeUrlBuilder } from '../../domain/services/security-email-change-url.interface';

export class ClientSecurityEmailChangeUrlBuilder implements ISecurityEmailChangeUrlBuilder {
  buildVerificationUrl(rawToken: string): string {
    return `${env.CLIENT_URL}/verify-email-change?token=${rawToken}`;
  }
}

export const clientSecurityEmailChangeUrlBuilder = new ClientSecurityEmailChangeUrlBuilder();
