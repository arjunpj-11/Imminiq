# Imminiq production deployment

This runbook is the release procedure for the Imminiq frontend, API, background workers, and
managed dependencies.

## Production topology

- The React frontend is built and hosted on Vercel.
- `/api/*` browser requests are proxied by Vercel to the Express API.
- The API is deployed from `apps/api/Dockerfile` on Render.
- MongoDB Atlas stores durable application data.
- Managed Redis stores sessions, one-time flows, rate-limit state, and BullMQ jobs.
- Cloudinary stores user-uploaded media.
- Piston executes learner code in an isolated external service.
- Metered TURN and WebRTC provide call connectivity.
- Groq, Gemini, Cerebras, and Cloudflare provide AI capabilities.

## Required configuration

Start from:

- `apps/api/.env.example`
- `apps/web/.env.example`

Store API secrets only in the deployment provider's encrypted environment settings. Never place
secret values in the frontend environment because every `VITE_*` value is visible in the browser
bundle.

Production requirements enforced by the API include:

- HTTPS frontend, API, and TURN endpoints
- TLS-enabled MongoDB and Redis connections
- different access-token and refresh-token secrets
- non-placeholder secrets
- production-strength password hashing
- a complete TURN configuration
- valid, bounded runtime and pagination values
- a cookie domain shared by the frontend and API when a cross-subdomain cookie is used

When Vercel and Render provider domains are used, leave `AUTH_COOKIE_DOMAIN` unset so the API uses
a host-only cookie.

## Pre-release verification

From a clean checkout:

```bash
npm ci
npm run check
```

`npm run check` verifies formatting, lint rules, all automated tests, architecture boundaries, and
both production builds.

Review dependency and CodeQL results in GitHub before approving the release. Do not deploy when a
high-severity production dependency advisory or a CodeQL error remains unresolved.

## Database and queue safety

1. Take a MongoDB snapshot before a schema migration.
2. Run only the migration required by the release.
3. Confirm indexes completed successfully.
4. Keep Redis available while the API and workers roll over.
5. Do not clear BullMQ queues during a normal deployment.
6. Verify failed and delayed jobs in Admin → System Health after deployment.

The included migration scripts are deliberately separate from API startup so a deploy cannot
silently mutate production data.

## Deployment order

1. Confirm MongoDB, Redis, Cloudinary, Piston, AI providers, payment credentials, email, SMS, and
   TURN credentials are healthy.
2. Deploy the API and wait for `/api/health/ready` to return HTTP 200.
3. Confirm background workers start without repeated failures.
4. Deploy the frontend.
5. Run the production smoke test.
6. Complete the manual release checks below.

## Automated smoke test

```bash
WEB_URL=https://your-frontend.example \
API_URL=https://your-api.example \
npm run smoke:production
```

The smoke test validates:

- frontend HTML delivery
- the frontend API proxy
- API liveness
- MongoDB and Redis readiness

## Manual release checks

- Register, verify, sign in, refresh, and sign out.
- Complete a two-factor authentication challenge.
- Create a tracker and open its roadmap and lesson.
- Run and submit a small code example.
- Generate or open a mock test.
- Send a direct message and verify real-time delivery.
- Test audio and video permission prompts on a physical phone and desktop browser.
- Upload an image and a document.
- Confirm admin feature pauses block the matching user routes and actions.
- Confirm an administrator can still manage paused features.
- Review support, moderation, audit, subscription, queue, and system-health screens.
- Confirm light/dark appearance, keyboard navigation, and a 320px mobile layout.

## Monitoring after release

Watch the first deployment window for:

- readiness failures
- elevated HTTP 429 or 5xx rates
- structured `api_error` and `client_error` events
- Redis disconnects
- failed or delayed BullMQ jobs
- AI provider fallback exhaustion
- payment webhook failures
- email or OTP provider failures
- call setup and TURN failures

Client telemetry intentionally excludes query strings and deduplicates repeated errors. API access
logs also omit query strings so OAuth codes and one-time tokens do not enter production logs.

## Rollback

1. Stop further frontend promotion.
2. Roll back the frontend to the previous successful Vercel deployment.
3. Roll back the API to the previous successful Render image.
4. If a migration is incompatible, follow its documented reverse migration or restore the MongoDB
   snapshot.
5. Do not restore Redis from an old snapshot unless incident recovery specifically requires it;
   stale sessions and jobs can create replay or duplication risks.
6. Run the smoke test again.
7. Record the incident and corrective action in the release notes.

## Release approval

A release is ready only when formatting, linting, architecture tests, security tests, integration
tests, production builds, health checks, and the manual critical-path smoke test are green.
