import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { Sha256RefreshTokenHasher } from '../../src/infrastructure/security/sha256-refresh-token-hasher'

describe('Sha256RefreshTokenHasher', () => {
  it('produces the stable SHA-256 digest expected by persisted sessions', () => {
    const token = 'refresh-token'
    const expected = createHash('sha256').update(token).digest('hex')

    expect(new Sha256RefreshTokenHasher().hash(token)).toBe(expected)
  })
})
