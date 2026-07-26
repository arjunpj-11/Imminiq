import { describe, expect, it, vi } from 'vitest';

import {
  ValidationApiError,
  validateObjectIdParam,
} from '../../src/shared/middlewares/validate.middleware';

const runValidator = (value: string) => {
  const next = vi.fn();
  validateObjectIdParam({} as never, {} as never, next, value, 'trackerId');
  return next;
};

describe('object-id route validation', () => {
  it('accepts a MongoDB object identifier', () => {
    const next = runValidator('507f1f77bcf86cd799439011');

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects safe-looking slugs before they reach Mongoose casts', () => {
    const next = runValidator('not-an-id');
    const error = next.mock.calls[0]?.[0];

    expect(error).toBeInstanceOf(ValidationApiError);
    expect(error).toMatchObject({
      statusCode: 400,
      errors: { trackerId: ['trackerId is invalid'] },
    });
  });
});
