import { createHash } from 'node:crypto';

import type { IRefreshTokenHasher } from '../../shared/security/refresh-token-hasher.interface';

export class Sha256RefreshTokenHasher implements IRefreshTokenHasher {
  hash(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}

export const sha256RefreshTokenHasher = new Sha256RefreshTokenHasher();
