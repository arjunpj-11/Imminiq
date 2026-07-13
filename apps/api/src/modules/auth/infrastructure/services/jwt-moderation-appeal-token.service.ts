import type { IModerationAppealToken } from '../../domain/services/moderation-appeal-token.interface';
import { createModerationAppealToken } from '../../../../shared/security/moderation-appeal-token.util';

export class JwtModerationAppealToken implements IModerationAppealToken {
  create(userId: string, identifier: string): string {
    return createModerationAppealToken(userId, identifier);
  }
}

export const jwtModerationAppealToken = new JwtModerationAppealToken();
