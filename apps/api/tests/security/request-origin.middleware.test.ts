import { describe, expect, it } from 'vitest';

import { verifyBrowserRequestOrigin } from '../../src/shared/middlewares/request-origin.middleware';
import { ApiError } from '../../src/shared/utils/api-error';
import {
  createMockRequest,
  createMockResponse,
  createNext,
  firstNextError,
} from '../helpers/middleware-test-helpers';

describe('verifyBrowserRequestOrigin', () => {
  it('allows safe GET requests even without browser headers', () => {
    const req = createMockRequest({
      method: 'GET',
    });
    const res = createMockResponse();
    const next = createNext();

    verifyBrowserRequestOrigin(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(firstNextError(next)).toBeUndefined();
  });

  it('allows unsafe requests from the configured frontend origin', () => {
    const req = createMockRequest({
      method: 'POST',
      headers: {
        origin: 'http://localhost:5173',
      },
    });
    const res = createMockResponse();
    const next = createNext();

    verifyBrowserRequestOrigin(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(firstNextError(next)).toBeUndefined();
  });

  it('rejects unsafe browser requests from a foreign Origin', () => {
    const req = createMockRequest({
      method: 'PATCH',
      headers: {
        origin: 'https://evil.example',
      },
    });
    const res = createMockResponse();
    const next = createNext();

    verifyBrowserRequestOrigin(req, res as never, next);

    const error = firstNextError(next);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      statusCode: 403,
      code: 'REQUEST_ORIGIN_REJECTED',
    });
  });

  it('rejects unsafe browser requests with a foreign Referer when Origin is absent', () => {
    const req = createMockRequest({
      method: 'DELETE',
      headers: {
        referer: 'https://evil.example/phish',
      },
    });
    const res = createMockResponse();
    const next = createNext();

    verifyBrowserRequestOrigin(req, res as never, next);

    const error = firstNextError(next);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      statusCode: 403,
      code: 'REQUEST_REFERER_REJECTED',
    });
  });

  it('allows CLI/server-to-server unsafe requests with neither Origin nor Referer', () => {
    const req = createMockRequest({
      method: 'POST',
    });
    const res = createMockResponse();
    const next = createNext();

    verifyBrowserRequestOrigin(req, res as never, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(firstNextError(next)).toBeUndefined();
  });
});
