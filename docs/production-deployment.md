# Production deployment

This repository deploys the React application to Vercel and the containerized API to Render. MongoDB, Redis, email, media, OAuth, AI providers, payments, and Piston are external managed dependencies.

## Required release checks

Run from the repository root using Node.js 22 and npm 10:

```bash
npm ci
npm run check
```

Pull requests to `main` or `sub-main` run the same lint, test, and build gates. Dependency Review blocks newly introduced high-severity dependency findings, and CodeQL analyzes JavaScript and TypeScript changes.

## API deployment

Create a Render environment group named `imminiq-production` and populate every variable in `apps/api/.env.example`. Never use example values in production. In particular:

- generate independent, cryptographically random JWT secrets of at least 32 characters;
- generate `TOTP_ENCRYPTION_KEY` as exactly 32 random bytes encoded as 64 hexadecimal characters;
- use TLS-backed MongoDB and Redis connections;
- set `CLIENT_URL` to the exact public frontend origin and `SERVER_URL` to the exact API origin;
- the checked-in configuration continues to use `imminiq-api.onrender.com`; do not point the
  Vercel rewrite or `VITE_SOCKET_URL` at `api.imminiq.com` until that hostname resolves and has a
  valid certificate;
- for the recommended custom-domain migration, serve the frontend and API from sibling domains,
  set `AUTH_COOKIE_DOMAIN` to their shared parent (for example `.imminiq.com`), and move the Vercel
  rewrite and `VITE_SOCKET_URL` together so password, OAuth, CSRF, and refresh flows share one
  cookie scope;
- register `${SERVER_URL}/api/auth/oauth/google/callback` and the equivalent GitHub URL with each
  OAuth provider; OAuth starts received through the frontend rewrite are redirected to this
  canonical API origin before the host-only state cookie is issued;
- restrict OAuth callback URLs, Cloudinary credentials, payment webhooks, and provider keys to production domains;
- keep Piston isolated from the API network and never expose a privileged executor directly to the public internet.
- keep the general API ceilings at or above the checked-in production baseline
  (`RATE_LIMIT_GLOBAL_MAX=6000` and `RATE_LIMIT_AUTHENTICATED_API_MAX=3000` per
  15-minute window); login, OTP, password-reset, upload, and moderation routes
  retain their own substantially lower abuse limits.

HTTP rate-limit counters are stored in Redis and shared by every API instance. Size Redis for the
configured request windows, and alert on Redis errors because the API intentionally fails closed
when it cannot enforce a distributed limit.

The checked-in `render.yaml` builds `apps/api/Dockerfile`. Render should probe `/api/health/ready`; container liveness uses `/api/health/live`.

### Admin action passwords

Superadmins are the password-free recovery authority. Admin and moderator accounts must each receive
their own action password from a superadmin before they can perform protected mutations. Passwords
are stored only as hashes and cannot be viewed after assignment. Rotate a staff member's password
immediately when access may have been shared or compromised.

Every moderator, admin, and superadmin must also have active TOTP two-factor authentication before
any `/api/admin` route is available. Enrol existing staff through Security settings before enabling
production traffic; action passwords remain an additional step-up control for protected mutations.

The notification worker delivers broadcasts in batches. Alert on failed jobs and broadcasts that
remain in `queued` or `processing` longer than the expected audience delivery window.

## Frontend deployment

Deploy `apps/web` as the Vercel project root. `VITE_API_URL=/api` uses the rewrite in `apps/web/vercel.json`. If the API hostname changes, update that rewrite in the same release or use an absolute `VITE_API_URL` and remove the proxy dependency.

Configure a credentialed production TURN service through
`VITE_WEBRTC_TURN_URL`, `VITE_WEBRTC_TURN_USERNAME`, and
`VITE_WEBRTC_TURN_CREDENTIAL`. STUN remains the development fallback, but TURN
is required for reliable audio and video calls across restrictive mobile,
corporate, and carrier-grade NAT networks.

## Release and rollback

1. Back up MongoDB and verify a restore in a non-production environment.
2. Apply database/index changes before traffic reaches code that requires them.
3. Deploy the API and wait for readiness to pass.
4. Deploy the frontend.
5. Run `WEB_URL=https://... API_URL=https://... npm run smoke:production`.
6. Verify login, refresh, logout, OAuth, 2FA, uploads, AI jobs, payments, Socket.IO, and Piston with production-safe test accounts.
7. Roll back both frontend and API when a contract-breaking release fails; do not roll back destructive data migrations without a tested reverse migration.

## Operations checklist

- Configure alerts for 5xx rate, latency, readiness failures, queue failures, Redis/MongoDB saturation, payment webhook failures, and AI-provider errors.
- Centralize structured application logs and redact tokens, cookies, secrets, OTPs, and personal data.
- Enable MongoDB point-in-time recovery and Redis persistence appropriate to session/queue durability.
- Rotate secrets regularly and immediately after suspected exposure.
- Set budget and rate alerts for AI, email/SMS, media, payment, and code-execution providers.
- Test graceful termination and rollback in staging before each infrastructure change.
- Run restore, incident-response, account-deletion, and dependency-update drills on a schedule.

Passing repository checks proves build integrity, not live-provider correctness. A release is approved only after staging and post-deployment smoke checks succeed.
