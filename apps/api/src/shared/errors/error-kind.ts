export type ErrorKind =
  | 'invalid-input'
  | 'unauthenticated'
  | 'forbidden'
  | 'missing-resource'
  | 'conflict'
  | 'rate-limited'
  | 'dependency-failure'
  | 'dependency-unavailable'
  | 'internal';

export interface IKindedError extends Error {
  readonly code: string;
  readonly kind: ErrorKind;
  readonly data?: Record<string, unknown>;
  readonly publicMessage?: string;
}
