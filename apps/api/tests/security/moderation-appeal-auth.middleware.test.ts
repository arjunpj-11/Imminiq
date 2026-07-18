import { describe, expect, it } from 'vitest';

import { authenticateModerationAppeal } from '../../src/shared/middlewares/moderation-appeal-auth.middleware';
import { createModerationAppealToken } from '../../src/shared/security/moderation-appeal-token.util';
import type { ApiError } from '../../src/shared/utils/ApiError';
import {
  createMockRequest,
  createMockResponse,
  createNext,
  firstNextError,
} from '../helpers/middleware-test-helpers';

describe('moderation appeal authorization', () => {
  it('rejects requests without an appeal capability', () => {
    const next = createNext();

    authenticateModerationAppeal(createMockRequest(), createMockResponse() as never, next);

    expect(firstNextError(next)).toMatchObject<ApiError>({
      statusCode: 401,
      code: 'APPEAL_TOKEN_REQUIRED',
    });
  });

  it('accepts a valid capability and binds its account context', () => {
    const token = createModerationAppealToken('user-123', 'user@example.com');
    const response = createMockResponse();
    const next = createNext();

    authenticateModerationAppeal(
      createMockRequest({ headers: { authorization: `Bearer ${token}` } }),
      response as never,
      next
    );

    expect(firstNextError(next)).toBeUndefined();
    expect(response.locals.appealAuthorization).toMatchObject({
      userId: 'user-123',
      identifier: 'user@example.com',
      purpose: 'moderation_appeal',
    });
  });
});
