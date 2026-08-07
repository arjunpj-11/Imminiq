import { z } from 'zod';
import dotenv from 'dotenv';
import { RUNTIME_DEFAULTS } from './constants';

dotenv.config();

const booleanFromString = z.preprocess(
  (value) => (typeof value === 'string' ? value.toLowerCase() === 'true' : value),
  z.boolean()
);

const jwtDurationSchema = z
  .string()
  .trim()
  .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN must be a duration such as 15m or 1h');

const isExactOriginUrl = (value: string) => {
  const parsed = new URL(value);
  return (
    !parsed.username &&
    !parsed.password &&
    !parsed.search &&
    !parsed.hash &&
    (parsed.pathname === '' || parsed.pathname === '/')
  );
};

const envSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),

    MONGO_URI: z
      .string()
      .min(1)
      .refine(
        (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
        'MONGO_URI must be a MongoDB URI'
      ),
    REDIS_URL: z
      .string()
      .min(1)
      .refine(
        (value) => value.startsWith('redis://') || value.startsWith('rediss://'),
        'REDIS_URL must be a Redis URI'
      ),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: jwtDurationSchema.default('15m'),

    CLIENT_URL: z.string().url().refine(isExactOriginUrl, 'CLIENT_URL must be an origin only'),
    SERVER_URL: z
      .string()
      .url()
      .refine(isExactOriginUrl, 'SERVER_URL must be an origin only')
      .default('http://localhost:5001'),
    AUTH_COOKIE_DOMAIN: z
      .string()
      .trim()
      .regex(/^\.?[a-z0-9](?:[a-z0-9.-]*[a-z0-9])$/i, 'AUTH_COOKIE_DOMAIN is invalid')
      .optional(),

    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),

    GROQ_API_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    CEREBRAS_API_KEY: z.string().min(1),
    YOUTUBE_DATA_API_KEY: z.string().optional().default(''),
    METERED_TURN_API_BASE_URL: z.string().url().optional(),
    METERED_TURN_SECRET_KEY: z.string().min(1).optional(),
    METERED_TURN_API_KEY: z.string().min(1).optional(),
    METERED_TURN_CREDENTIAL_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(600)
      .max(86_400)
      .default(RUNTIME_DEFAULTS.METERED_TURN_CREDENTIAL_TTL_SECONDS),
    METERED_TURN_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(30_000)
      .default(RUNTIME_DEFAULTS.METERED_TURN_REQUEST_TIMEOUT_MS),

    RAZORPAY_KEY_ID: z
      .string()
      .trim()
      .regex(
        /^rzp_(?:test|live)_[A-Za-z0-9]+$/,
        'RAZORPAY_KEY_ID must be a Razorpay key ID beginning with rzp_test_ or rzp_live_'
      ),
    RAZORPAY_KEY_SECRET: z.string().min(1),

    EMAIL_FROM: z.string().min(1),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),

    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),

    MESSAGE_CENTRAL_CUSTOMER_ID: z.string().min(1),
    MESSAGE_CENTRAL_EMAIL: z.string().email(),
    MESSAGE_CENTRAL_PASSWORD: z.string().min(1),
    MESSAGE_CENTRAL_COUNTRY_CODE: z.string().default('91'),
    MESSAGE_CENTRAL_BASE_URL: z.string().url().default(RUNTIME_DEFAULTS.MESSAGE_CENTRAL_BASE_URL),

    CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),

    CLOUDFLARE_AI_API_TOKEN: z.string().min(1, 'CLOUDFLARE_AI_API_TOKEN is required'),

    CLOUDFLARE_IMAGE_MODEL: z.string().default('@cf/black-forest-labs/flux-1-schnell'),

    TOTP_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, 'TOTP_ENCRYPTION_KEY must be a 64-character hex string'),
    PISTON_API_URL: z
      .string()
      .url('PISTON_API_URL must be a valid URL')
      .default('https://emkc.org/api/v2/piston'),

    PISTON_API_KEY: z.string().optional().default(''),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
    REFRESH_TOKEN_TTL_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.REFRESH_TOKEN_TTL_MS),

    TWO_FACTOR_CHALLENGE_TTL_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.TWO_FACTOR_CHALLENGE_TTL_MINUTES),

    PASSWORD_RESET_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.PASSWORD_RESET_TOKEN_TTL_SECONDS),
    PENDING_REGISTRATION_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.PENDING_REGISTRATION_TTL_SECONDS),
    OAUTH_STATE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.OAUTH_STATE_TTL_SECONDS),
    SECURITY_EMAIL_CHANGE_TOKEN_TTL_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.SECURITY_EMAIL_CHANGE_TOKEN_TTL_MINUTES),

    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(16).default(RUNTIME_DEFAULTS.BCRYPT_ROUNDS),

    OTP_EXPIRES_MINUTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.OTP_EXPIRES_MINUTES),

    AUTH_LOGIN_ATTEMPT_WINDOW_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.AUTH_LOGIN_ATTEMPT_WINDOW_SECONDS),
    AUTH_LOGIN_MAX_ATTEMPTS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.AUTH_LOGIN_MAX_ATTEMPTS),
    AUTH_LOGIN_BLOCK_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.AUTH_LOGIN_BLOCK_SECONDS),
    OTP_ATTEMPT_WINDOW_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.OTP_ATTEMPT_WINDOW_SECONDS),
    OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(RUNTIME_DEFAULTS.OTP_MAX_ATTEMPTS),
    OTP_BLOCK_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.OTP_BLOCK_SECONDS),
    TWO_FACTOR_ATTEMPT_WINDOW_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.TWO_FACTOR_ATTEMPT_WINDOW_SECONDS),
    TWO_FACTOR_MAX_ATTEMPTS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.TWO_FACTOR_MAX_ATTEMPTS),
    TWO_FACTOR_BLOCK_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.TWO_FACTOR_BLOCK_SECONDS),

    RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_GLOBAL_WINDOW_MS),
    RATE_LIMIT_GLOBAL_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_GLOBAL_MAX),

    RATE_LIMIT_AUTHENTICATED_API_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_WINDOW_MS),
    RATE_LIMIT_AUTHENTICATED_API_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_AUTHENTICATED_API_MAX),
    RATE_LIMIT_AUTH_SESSION_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_AUTH_SESSION_WINDOW_MS),
    RATE_LIMIT_AUTH_SESSION_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_AUTH_SESSION_MAX),
    RATE_LIMIT_PUBLIC_LOOKUP_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_PUBLIC_LOOKUP_WINDOW_MS),
    RATE_LIMIT_PUBLIC_LOOKUP_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_PUBLIC_LOOKUP_MAX),
    RATE_LIMIT_OAUTH_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_OAUTH_WINDOW_MS),
    RATE_LIMIT_OAUTH_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_OAUTH_MAX),
    RATE_LIMIT_REGISTER_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_REGISTER_WINDOW_MS),
    RATE_LIMIT_REGISTER_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_REGISTER_MAX),
    RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_LOGIN_WINDOW_MS),
    RATE_LIMIT_LOGIN_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_LOGIN_MAX),
    RATE_LIMIT_SENSITIVE_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_SENSITIVE_WINDOW_MS),
    RATE_LIMIT_SENSITIVE_DEFAULT_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_SENSITIVE_DEFAULT_MAX),
    RATE_LIMIT_OTP_SEND_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_OTP_SEND_MAX),
    RATE_LIMIT_FORGOT_PASSWORD_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_FORGOT_PASSWORD_MAX),
    RATE_LIMIT_RESET_PASSWORD_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_RESET_PASSWORD_MAX),
    RATE_LIMIT_MODERATION_APPEAL_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_MODERATION_APPEAL_WINDOW_MS),
    RATE_LIMIT_MODERATION_APPEAL_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.RATE_LIMIT_MODERATION_APPEAL_MAX),

    UPLOAD_IMAGE_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.UPLOAD_IMAGE_MAX_BYTES),
    UPLOAD_AVATAR_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.UPLOAD_AVATAR_MAX_BYTES),
    UPLOAD_BANNER_MAX_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.UPLOAD_BANNER_MAX_BYTES),
    MOCK_TEST_AI_GENERATION_ENABLED: booleanFromString.default(
      RUNTIME_DEFAULTS.MOCK_TEST_AI_GENERATION_ENABLED
    ),
    QUEUE_JOB_ATTEMPTS: z.coerce
      .number()
      .int()
      .min(1)
      .max(10)
      .default(RUNTIME_DEFAULTS.QUEUE_JOB_ATTEMPTS),
    QUEUE_JOB_BACKOFF_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.QUEUE_JOB_BACKOFF_MS),
    AI_WORKER_CONCURRENCY: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(RUNTIME_DEFAULTS.AI_WORKER_CONCURRENCY),
    AI_WORKER_REQUESTS_PER_MINUTE: z.coerce
      .number()
      .int()
      .min(1)
      .max(1_000)
      .default(RUNTIME_DEFAULTS.AI_WORKER_REQUESTS_PER_MINUTE),
    AI_TRACKER_INTAKE_TEMPERATURE: z.coerce
      .number()
      .min(0)
      .max(2)
      .default(RUNTIME_DEFAULTS.AI_TRACKER_INTAKE_TEMPERATURE),
    AI_ADAPTIVE_ASSESSMENT_TEMPERATURE: z.coerce
      .number()
      .min(0)
      .max(2)
      .default(RUNTIME_DEFAULTS.AI_ADAPTIVE_ASSESSMENT_TEMPERATURE),
    AI_ADAPTIVE_ADVISOR_TEMPERATURE: z.coerce
      .number()
      .min(0)
      .max(2)
      .default(RUNTIME_DEFAULTS.AI_ADAPTIVE_ADVISOR_TEMPERATURE),
    TRACKER_INTAKE_CONTEXT_TRACKER_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(RUNTIME_DEFAULTS.TRACKER_INTAKE_CONTEXT_TRACKER_LIMIT),
    TRACKER_INTAKE_CONTEXT_TEST_REPORT_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(RUNTIME_DEFAULTS.TRACKER_INTAKE_CONTEXT_TEST_REPORT_LIMIT),
    QUEUE_REMOVE_ON_COMPLETE: z.coerce
      .number()
      .int()
      .min(0)
      .default(RUNTIME_DEFAULTS.QUEUE_REMOVE_ON_COMPLETE),
    QUEUE_REMOVE_ON_FAIL: z.coerce
      .number()
      .int()
      .min(0)
      .default(RUNTIME_DEFAULTS.QUEUE_REMOVE_ON_FAIL),
    GROQ_DEFAULT_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GROQ_DEFAULT_MODEL),
    GROQ_FAST_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GROQ_FAST_MODEL),
    GROQ_MAX_TOKENS: z.coerce.number().int().positive().default(RUNTIME_DEFAULTS.GROQ_MAX_TOKENS),
    GROQ_TRANSCRIPTION_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GROQ_TRANSCRIPTION_MODEL),
    GEMINI_DEFAULT_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GEMINI_DEFAULT_MODEL),
    GEMINI_FAST_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GEMINI_FAST_MODEL),
    GEMINI_NEXT_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GEMINI_NEXT_MODEL),
    GEMINI_HISTORY_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.GEMINI_HISTORY_MODEL),
    CEREBRAS_MODEL: z.string().min(1).default(RUNTIME_DEFAULTS.CEREBRAS_MODEL),
    YOUTUBE_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.YOUTUBE_REQUEST_TIMEOUT_MS),
    YOUTUBE_MAX_RESULTS: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(RUNTIME_DEFAULTS.YOUTUBE_MAX_RESULTS),
    LEADERBOARD_SNAPSHOT_BATCH_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.LEADERBOARD_SNAPSHOT_BATCH_SIZE),
    PLAN_LIMIT_USAGE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.PLAN_LIMIT_USAGE_TTL_SECONDS),
    DASHBOARD_ONLINE_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .default(RUNTIME_DEFAULTS.DASHBOARD_ONLINE_WINDOW_MS),
    PAGINATION_DEFAULT_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(RUNTIME_DEFAULTS.PAGINATION_DEFAULT_LIMIT),
    PAGINATION_PROFILE_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(RUNTIME_DEFAULTS.PAGINATION_PROFILE_LIMIT),
    PAGINATION_GRID_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(RUNTIME_DEFAULTS.PAGINATION_GRID_LIMIT),
    PAGINATION_ADMIN_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(RUNTIME_DEFAULTS.PAGINATION_ADMIN_LIMIT),
    PAGINATION_BATCH_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(RUNTIME_DEFAULTS.PAGINATION_BATCH_LIMIT),
    PAGINATION_MESSAGE_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(RUNTIME_DEFAULTS.PAGINATION_MESSAGE_LIMIT),
    PAGINATION_MAX_STANDARD_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(RUNTIME_DEFAULTS.PAGINATION_MAX_STANDARD_LIMIT),
    PAGINATION_MAX_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .max(250)
      .default(RUNTIME_DEFAULTS.PAGINATION_MAX_LIMIT),
  })
  .refine((value) => value.JWT_SECRET !== value.JWT_REFRESH_SECRET, {
    message: 'JWT secrets must be different',
    path: ['JWT_REFRESH_SECRET'],
  })
  .refine(
    (value) =>
      Boolean(value.METERED_TURN_API_BASE_URL) ===
      Boolean(value.METERED_TURN_SECRET_KEY || value.METERED_TURN_API_KEY),
    {
      message: 'Metered TURN API base URL and a secret key or credential API key are required',
      path: ['METERED_TURN_SECRET_KEY'],
    }
  )
  .superRefine((value, context) => {
    if (
      value.PAGINATION_DEFAULT_LIMIT > value.PAGINATION_MAX_STANDARD_LIMIT ||
      value.PAGINATION_MAX_STANDARD_LIMIT > value.PAGINATION_MAX_LIMIT
    ) {
      context.addIssue({
        code: 'custom',
        path: ['PAGINATION_DEFAULT_LIMIT'],
        message: 'Pagination limits must satisfy default <= standard maximum <= absolute maximum',
      });
    }

    if (value.NODE_ENV !== 'production') return;

    for (const [field, url] of [
      ['CLIENT_URL', value.CLIENT_URL],
      ['SERVER_URL', value.SERVER_URL],
    ] as const) {
      if (new URL(url).protocol !== 'https:') {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: `${field} must use HTTPS in production`,
        });
      }
    }

    const clientHost = new URL(value.CLIENT_URL).hostname.toLowerCase();
    const serverHost = new URL(value.SERVER_URL).hostname.toLowerCase();
    const cookieDomain = value.AUTH_COOKIE_DOMAIN?.replace(/^\./, '').toLowerCase();
    const belongsToCookieDomain = (host: string) =>
      Boolean(cookieDomain && (host === cookieDomain || host.endsWith(`.${cookieDomain}`)));

    if (
      cookieDomain &&
      (!cookieDomain.includes('.') ||
        !belongsToCookieDomain(clientHost) ||
        !belongsToCookieDomain(serverHost))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['AUTH_COOKIE_DOMAIN'],
        message: 'AUTH_COOKIE_DOMAIN must be a shared parent of CLIENT_URL and SERVER_URL',
      });
    }

    if (!value.REDIS_URL.startsWith('rediss://')) {
      context.addIssue({
        code: 'custom',
        path: ['REDIS_URL'],
        message: 'REDIS_URL must use TLS (rediss://) in production',
      });
    }

    const mongoUsesTls =
      value.MONGO_URI.startsWith('mongodb+srv://') ||
      /[?&](?:tls|ssl)=true(?:&|$)/i.test(value.MONGO_URI);
    if (!mongoUsesTls) {
      context.addIssue({
        code: 'custom',
        path: ['MONGO_URI'],
        message: 'MONGO_URI must enable TLS in production',
      });
    }

    for (const field of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (/replace[-_ ]?with|change[-_ ]?me|example|default/i.test(value[field])) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: `${field} must not use an example or default value in production`,
        });
      }
    }

    if (value.BCRYPT_ROUNDS < 12) {
      context.addIssue({
        code: 'custom',
        path: ['BCRYPT_ROUNDS'],
        message: 'BCRYPT_ROUNDS must be at least 12 in production',
      });
    }

    if (
      !value.METERED_TURN_API_BASE_URL ||
      (!value.METERED_TURN_SECRET_KEY && !value.METERED_TURN_API_KEY)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['METERED_TURN_SECRET_KEY'],
        message: 'Metered TURN configuration is required in production',
      });
    } else if (new URL(value.METERED_TURN_API_BASE_URL).protocol !== 'https:') {
      context.addIssue({
        code: 'custom',
        path: ['METERED_TURN_API_BASE_URL'],
        message: 'METERED_TURN_API_BASE_URL must use HTTPS in production',
      });
    }
  });

export const parseApiEnvironment = (source: Record<string, unknown>) => envSchema.parse(source);

export const env = parseApiEnvironment(process.env);
