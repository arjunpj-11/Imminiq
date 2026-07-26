import { createHash } from 'node:crypto';

import { z } from 'zod';

import { ServiceError } from '../../../../../shared/errors/service.error';
import type {
  CallIceServer,
  ICallIceServerProvider,
} from '../../domain/services/call-ice-server.provider.interface';

const credentialSchema = z.object({
  apiKey: z.string().min(1),
});

const iceServerSchema = z
  .object({
    urls: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    username: z.string().min(1).optional(),
    credential: z.string().min(1).optional(),
  })
  .superRefine((server, context) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    const isTurn = urls.some((url) => /^turns?:/i.test(url));
    if (isTurn && (!server.username || !server.credential)) {
      context.addIssue({
        code: 'custom',
        message: 'TURN entries require a username and credential',
      });
    }
  });

const iceServersSchema = z.array(iceServerSchema).min(1);

type MeteredCallIceServerProviderOptions = {
  apiBaseUrl: string;
  secretKey?: string;
  apiKey?: string;
  credentialTtlSeconds: number;
  requestTimeoutMs: number;
  request?: typeof fetch;
  now?: () => number;
};

type CachedIceServers = {
  expiresAt: number;
  value: CallIceServer[];
};

export class MeteredCallIceServerProvider implements ICallIceServerProvider {
  private readonly _cache = new Map<string, CachedIceServers>();
  private readonly _request: typeof fetch;
  private readonly _now: () => number;

  constructor(private readonly _options: MeteredCallIceServerProviderOptions) {
    this._request = _options.request ?? fetch;
    this._now = _options.now ?? Date.now;
  }

  async getIceServers(userId: string): Promise<CallIceServer[]> {
    const cached = this._cache.get(userId);
    if (cached && cached.expiresAt > this._now()) return cached.value;

    try {
      const apiKey =
        this._options.apiKey ?? (await this.createCredential(userId)).apiKey;
      const iceServers = await this.loadIceServers(apiKey);
      const cacheSafetySeconds = Math.min(300, this._options.credentialTtlSeconds / 4);
      this._cache.set(userId, {
        expiresAt:
          this._now() + (this._options.credentialTtlSeconds - cacheSafetySeconds) * 1_000,
        value: iceServers,
      });
      return iceServers;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw this.providerFailure(error);
    }
  }

  private async createCredential(userId: string) {
    if (!this._options.secretKey) {
      throw this.providerFailure(new Error('Metered TURN secret key is not configured'));
    }
    const url = new URL('/api/v1/turn/credential', this._options.apiBaseUrl);
    url.searchParams.set('secretKey', this._options.secretKey);
    const label = `imminiq-${createHash('sha256').update(userId).digest('hex').slice(0, 12)}-${this._now().toString(36)}`;
    const response = await this._request(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        expiryInSeconds: this._options.credentialTtlSeconds,
        label,
      }),
      signal: AbortSignal.timeout(this._options.requestTimeoutMs),
    });
    if (!response.ok) throw this.providerFailure(new Error(`Credential request failed: ${response.status}`));
    const parsed = credentialSchema.safeParse(await response.json());
    if (!parsed.success) throw this.providerFailure(parsed.error);
    return parsed.data;
  }

  private async loadIceServers(apiKey: string): Promise<CallIceServer[]> {
    const url = new URL('/api/v1/turn/credentials', this._options.apiBaseUrl);
    url.searchParams.set('apiKey', apiKey);
    const response = await this._request(url, {
      signal: AbortSignal.timeout(this._options.requestTimeoutMs),
    });
    if (!response.ok) throw this.providerFailure(new Error(`ICE request failed: ${response.status}`));
    const parsed = iceServersSchema.safeParse(await response.json());
    if (!parsed.success) throw this.providerFailure(parsed.error);
    return parsed.data;
  }

  private providerFailure(cause: unknown) {
    return ServiceError.dependencyUnavailable(
      'METERED_TURN_UNAVAILABLE',
      'Metered TURN credentials could not be issued',
      cause,
      'Secure call relay is temporarily unavailable'
    );
  }
}
