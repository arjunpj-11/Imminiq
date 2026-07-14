import type { NextFunction, Request, Response } from 'express';
import { vi } from 'vitest';

export type MockResponse = Partial<Response> & {
  locals: Record<string, unknown>;
  cookiesWritten: Map<string, unknown>;
  cookiesCleared: string[];
  redirectedTo: string | null;
};

export const createMockRequest = (overrides: Partial<Request> = {}): Request => {
  const headers = new Map<string, string>();

  const request = {
    method: 'GET',
    query: {},
    cookies: {},
    file: undefined,
    get: (name: string) => headers.get(name.toLowerCase()),
    ...overrides,
  } as Request;

  if (overrides.headers) {
    for (const [key, value] of Object.entries(overrides.headers)) {
      if (typeof value === 'string') {
        headers.set(key.toLowerCase(), value);
      }
    }
  }

  return request;
};

export const createMockResponse = (): MockResponse => {
  const cookiesWritten = new Map<string, unknown>();
  const cookiesCleared: string[] = [];

  const response: MockResponse = {
    locals: {},
    cookiesWritten,
    cookiesCleared,
    redirectedTo: null,

    cookie: vi.fn((name: string, value: unknown) => {
      cookiesWritten.set(name, value);
      return response as Response;
    }),

    clearCookie: vi.fn((name: string) => {
      cookiesCleared.push(name);
      return response as Response;
    }),

    redirect: vi.fn((statusOrLocation: number | string, maybeLocation?: string) => {
      response.redirectedTo =
        typeof statusOrLocation === 'string' ? statusOrLocation : (maybeLocation ?? null);
    }) as unknown as Response['redirect'],
  };

  return response;
};

export const createNext = () => {
  return vi.fn() as unknown as NextFunction;
};

export const firstNextError = (next: ReturnType<typeof createNext>): unknown => {
  const mock = next as unknown as {
    mock: {
      calls: unknown[][];
    };
  };

  return mock.mock.calls[0]?.[0];
};
