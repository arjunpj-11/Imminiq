import { redis } from '../../config/redis';

export type OAuthProvider = 'google' | 'github';

const OAUTH_STATE_PREFIX = 'oauth-state';

const keyFor = (provider: OAuthProvider, state: string) => {
  return `${OAUTH_STATE_PREFIX}:${provider}:${state}`;
};

const CONSUME_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if value then
  redis.call('DEL', KEYS[1])
  return value
end
return nil
`;

export const oauthStateCache = {
  async save(provider: OAuthProvider, state: string, expiresInSeconds: number): Promise<void> {
    await redis.set(keyFor(provider, state), '1', 'EX', expiresInSeconds);
  },

  async consume(provider: OAuthProvider, state: string): Promise<boolean> {
    const consumed = await redis.eval(CONSUME_SCRIPT, 1, keyFor(provider, state));

    return consumed === '1';
  },
};
