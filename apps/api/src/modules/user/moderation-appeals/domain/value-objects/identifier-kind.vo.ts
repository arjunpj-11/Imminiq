export type IdentifierKind = 'email' | 'phone'

export const IDENTIFIER_KINDS = {
  EMAIL: 'email',
  PHONE: 'phone',
} as const satisfies Record<string, IdentifierKind>
