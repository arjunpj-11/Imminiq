import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import request from 'supertest';
import type { Express } from 'express';

import { User } from '../../src/infrastructure/database/models/user.model';

export const TRUSTED_TEST_ORIGIN = 'http://localhost:5173';

export type TestUserFixture = {
  userId: string;
  email: string;
  username: string;
  password: string;
};

export type AuthenticatedFixture = TestUserFixture & {
  accessToken: string;
  cookieHeader: string[];
  csrfToken: string;
};

const readSetCookies = (setCookieHeader: string[] | string | undefined): string[] => {
  if (Array.isArray(setCookieHeader)) {
    return setCookieHeader;
  }

  return setCookieHeader ? [setCookieHeader] : [];
};

const readCookieValue = (cookies: string[], cookieName: string): string => {
  const prefix = `${cookieName}=`;

  const cookie = cookies.find((value) => {
    return value.startsWith(prefix);
  });

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.split(';')[0]?.slice(prefix.length) || '');
};

export const createVerifiedLocalUser = async (
  input?: Partial<Pick<TestUserFixture, 'email' | 'username' | 'password'>>
): Promise<TestUserFixture> => {
  const suffix = `${Date.now()}_${randomBytes(3).toString('hex')}`;

  const email = input?.email ?? `security_${suffix}@example.com`;

  const username = input?.username ?? `security_${suffix}`;

  const password = input?.password ?? 'SecurePassword123!';

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName: 'Security Integration User',
    username,
    email,
    passwordHash,
    provider: 'local',
    role: 'user',
    status: 'active',
    emailVerified: true,
    phoneVerified: false,
    onboardingCompleted: false,
    deletedAt: null,
  });

  return {
    userId: user._id.toString(),
    email,
    username,
    password,
  };
};

export const loginFixtureUser = async (
  app: Express,
  user: TestUserFixture
): Promise<AuthenticatedFixture> => {
  const response = await request(app)
    .post('/api/auth/login')
    .set('Origin', TRUSTED_TEST_ORIGIN)
    .send({
      identifier: user.email,
      password: user.password,
    });

  if (response.status !== 200) {
    throw new Error(`Fixture login failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const accessToken =
    typeof response.body?.data?.accessToken === 'string' ? response.body.data.accessToken : '';

  if (!accessToken) {
    throw new Error('Fixture login did not return access token');
  }

  const cookieHeader = readSetCookies(response.headers['set-cookie']);
  const csrfToken = readCookieValue(cookieHeader, 'csrfToken');

  if (!csrfToken) {
    throw new Error('Fixture login did not return CSRF token cookie');
  }

  return {
    ...user,
    accessToken,
    cookieHeader,
    csrfToken,
  };
};
