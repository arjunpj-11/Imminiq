import { redis } from '../../config/redis'

const RESET_SESSION_PREFIX = 'password-reset-session'

const keyFor = (jti: string) => {
  return `${RESET_SESSION_PREFIX}:${jti}`
}

const CONSUME_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if value then
  redis.call('DEL', KEYS[1])
  return value
end
return nil
`

export const passwordResetSessionCache = {
  async save(
    jti: string,
    userId: string,
    expiresInSeconds: number
  ): Promise<void> {
    await redis.set(
      keyFor(jti),
      userId,
      'EX',
      expiresInSeconds
    )
  },

  async consume(
    jti: string
  ): Promise<string | null> {
    const value = await redis.eval(
      CONSUME_SCRIPT,
      1,
      keyFor(jti)
    )

    return typeof value === 'string'
      ? value
      : null
  },
}
