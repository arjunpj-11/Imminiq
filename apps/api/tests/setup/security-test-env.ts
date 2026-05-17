/**
 * Minimum test-only environment defaults.
 *
 * These values are intentionally fake and must never be used outside tests.
 * They keep env parsing stable when isolated security modules import `env`.
 */

process.env.NODE_ENV ??= 'test'
process.env.PORT ??= '5009'

process.env.CLIENT_URL ??= 'http://localhost:5173'
process.env.SERVER_URL ??= 'http://localhost:5009'

process.env.MONGO_URI ??= 'mongodb://127.0.0.1:27017/imminiq_security_tests'
process.env.REDIS_URL ??= 'redis://127.0.0.1:6379/15'

process.env.JWT_SECRET ??=
  'test-jwt-secret-test-jwt-secret-test-jwt-secret-test-jwt-secret'
process.env.JWT_REFRESH_SECRET ??=
  'test-refresh-secret-test-refresh-secret-test-refresh-secret'
process.env.JWT_EXPIRES_IN ??= '15m'
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d'

process.env.TOTP_ENCRYPTION_KEY ??=
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

process.env.GOOGLE_CLIENT_ID ??= 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET ??= 'test-google-client-secret'
process.env.GITHUB_CLIENT_ID ??= 'test-github-client-id'
process.env.GITHUB_CLIENT_SECRET ??= 'test-github-client-secret'

process.env.SMTP_HOST ??= 'smtp.test.local'
process.env.SMTP_PORT ??= '587'
process.env.SMTP_USER ??= 'test-smtp-user'
process.env.SMTP_PASS ??= 'test-smtp-pass'
process.env.SMTP_FROM ??= 'Imminiq Tests <tests@imminiq.local>'

process.env.CLOUDINARY_CLOUD_NAME ??= 'test-cloud'
process.env.CLOUDINARY_API_KEY ??= 'test-cloud-key'
process.env.CLOUDINARY_API_SECRET ??= 'test-cloud-secret'

process.env.MESSAGE_CENTRAL_CUSTOMER_ID ??= 'test-message-central-customer'
process.env.MESSAGE_CENTRAL_PASSWORD ??= 'test-message-central-password'
process.env.MESSAGE_CENTRAL_COUNTRY_CODE ??= '91'
process.env.MESSAGE_CENTRAL_EMAIL ??= 'sms-tests@imminiq.local'

process.env.ANTHROPIC_API_KEY ??= 'test-anthropic-key'
process.env.GROQ_API_KEY ??= 'test-groq-key'
process.env.GEMINI_API_KEY ??= 'test-gemini-key'
process.env.CLOUDFLARE_ACCOUNT_ID ??= 'test-cloudflare-account'
process.env.CLOUDFLARE_API_TOKEN ??= 'test-cloudflare-token'

process.env.RAZORPAY_KEY_ID ??= 'test-razorpay-key'
process.env.RAZORPAY_KEY_SECRET ??= 'test-razorpay-secret'

process.env.AWS_ACCESS_KEY_ID ??= 'test-aws-key'
process.env.AWS_SECRET_ACCESS_KEY ??= 'test-aws-secret'
process.env.AWS_REGION ??= 'ap-south-1'
process.env.AWS_S3_BUCKET ??= 'imminiq-test-bucket'
