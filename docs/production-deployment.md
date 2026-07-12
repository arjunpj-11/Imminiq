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
- restrict OAuth callback URLs, Cloudinary credentials, payment webhooks, and provider keys to production domains;
- keep Piston isolated from the API network and never expose a privileged executor directly to the public internet.

The checked-in `render.yaml` builds `apps/api/Dockerfile`. Render should probe `/api/health/ready`; container liveness uses `/api/health/live`.

## Frontend deployment

Deploy `apps/web` as the Vercel project root. `VITE_API_URL=/api` uses the rewrite in `apps/web/vercel.json`. If the API hostname changes, update that rewrite in the same release or use an absolute `VITE_API_URL` and remove the proxy dependency.

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
