import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

import { env } from '../../config/env';

const AUTH_COOKIE_TOKEN_VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const getEncryptionKey = (): Buffer => {
  return createHash('sha256').update(env.JWT_REFRESH_SECRET).digest();
};

export const encryptAuthCookieToken = (rawToken: string): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([cipher.update(rawToken, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [
    AUTH_COOKIE_TOKEN_VERSION,
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
};

export const decryptAuthCookieToken = (encryptedToken: string): string => {
  const [version, ivBase64Url, authTagBase64Url, payloadBase64Url] = encryptedToken.split('.');

  if (
    version !== AUTH_COOKIE_TOKEN_VERSION ||
    !ivBase64Url ||
    !authTagBase64Url ||
    !payloadBase64Url
  ) {
    throw new Error('Invalid encrypted authentication cookie token');
  }

  const iv = Buffer.from(ivBase64Url, 'base64url');
  const authTag = Buffer.from(authTagBase64Url, 'base64url');
  const payload = Buffer.from(payloadBase64Url, 'base64url');

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);

  return decrypted.toString('utf8');
};
