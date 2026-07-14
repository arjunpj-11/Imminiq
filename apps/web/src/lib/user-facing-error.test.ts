import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';

import { getUserFacingError, getValidationErrors, type IApiErrorPayload } from './user-facing-error';

const apiError = (status: number, data: unknown) => {
  const response = {
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: {} },
    data,
  } as AxiosResponse<IApiErrorPayload>;

  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response);
};

describe('user-facing API errors', () => {
  it('replaces raw or HTML 404 responses with a useful message', () => {
    expect(getUserFacingError(apiError(404, '<html>Cannot GET /api/missing</html>'))).toBe(
      "We couldn't find what you requested. It may have moved or no longer exists."
    );
  });

  it('uses safe messages for known error codes', () => {
    expect(
      getUserFacingError(
        apiError(404, {
          success: false,
          code: 'API_ROUTE_NOT_FOUND',
          message: 'Cannot GET /api/missing',
        })
      )
    ).toBe("We couldn't find the requested service. Refresh the page and try again.");
  });

  it('keeps authored operational messages for specific client errors', () => {
    expect(
      getUserFacingError(
        apiError(409, { code: 'FRIEND_REQUEST_EXISTS', message: 'A friend request is already pending.' })
      )
    ).toBe('A friend request is already pending.');
  });

  it('never exposes server error details', () => {
    expect(
      getUserFacingError(apiError(500, { message: 'MongoServerError: credentials leaked' }))
    ).toBe('Something went wrong on our side. Please try again.');
  });

  it('returns field errors from the shared validation contract', () => {
    const error = apiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: { email: ['Enter a valid email address.'] },
    });

    expect(getUserFacingError(error)).toBe('Enter a valid email address.');
    expect(getValidationErrors(error)).toEqual({ email: ['Enter a valid email address.'] });
  });

  it('uses a connection message when no response was received', () => {
    expect(getUserFacingError(new AxiosError('Network Error'))).toBe(
      'Unable to reach the server. Check your connection and try again.'
    );
  });
});
