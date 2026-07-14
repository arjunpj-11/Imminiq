import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { apiNotFoundHandler, errorHandler } from '../../src/shared/middlewares/errorHandler';

const responseDouble = () => {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { response: { headersSent: false, status } as unknown as Response, status, json };
};

const handle = (error: unknown) => {
  const { response, status, json } = responseDouble();
  const next = vi.fn() as NextFunction;
  errorHandler(error, {} as Request, response, next);
  return { status, json, next };
};

describe('API error boundary', () => {
  it('turns unmatched API routes into a structured 404 error', () => {
    const next = vi.fn();
    apiNotFoundHandler({} as Request, {} as Response, next);

    const error = next.mock.calls[0]?.[0] as Error & { statusCode: number; code: string };
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('API_ROUTE_NOT_FOUND');
    expect(error.message).toContain("couldn't find");
  });

  it('formats validation failures by field', () => {
    const schema = z.object({ email: z.email('Enter a valid email address.') });
    const result = schema.safeParse({ email: 'invalid' });
    if (result.success) throw new Error('Expected schema parsing to fail');

    const { status, json } = handle(result.error);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 'VALIDATION_ERROR',
        errors: { email: ['Enter a valid email address.'] },
      })
    );
  });

  it('reports malformed JSON as a client error', () => {
    const error = Object.assign(new SyntaxError('Unexpected token'), {
      status: 400,
      type: 'entity.parse.failed',
    });
    const { status, json } = handle(error);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'MALFORMED_JSON' }));
  });

  it('normalizes body-parser and other HTTP errors without exposing internals', () => {
    const error = Object.assign(new Error('request entity exceeded private byte limit'), {
      status: 413,
      type: 'entity.too.large',
    });
    const { status, json } = handle(error);

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'The request is too large. Submit less information or a smaller file and try again.',
      code: 'HTTP_413',
    });
  });

  it('maps duplicate database records to a conflict without leaking details', () => {
    const { status, json } = handle(Object.assign(new Error('duplicate key secret'), { code: 11000 }));

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'A record with the same unique information already exists.',
      code: 'DUPLICATE_RESOURCE',
    });
  });

  it('hides unexpected server error details', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { status, json } = handle(new Error('database password is secret'));

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: 'Something went wrong on our side. Please try again.',
      code: 'INTERNAL_ERROR',
    });
    consoleError.mockRestore();
  });
});
