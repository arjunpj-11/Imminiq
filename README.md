# Imminiq

> An AI-powered learning platform — built with a clean architecture monorepo, hardened auth, and intelligent onboarding and tracking flows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript (Strict Clean Architecture) |
| Database | MongoDB Atlas |
| Cache / Sessions | Redis |
| Realtime | Socket.io |
| Background Jobs | BullMQ |
| Monorepo | Turborepo + npm workspaces |

---

## Project Status

**Active feature development** — started May 6, 2026.

Core platform foundation is in place. Development is now focused on deeper product modules.

---

## What's Built

### Infrastructure
- Turborepo monorepo with root-level dev, build, lint, and test scripts
- Git workflow: feature branches → `sub-main` → `main`

### Authentication & Security
- Email/phone registration with OTP (Redis-backed)
- Login, logout, refresh-token rotation, and `/me` session restoration
- Google OAuth and GitHub OAuth with cookie-based callback flow
- Two-factor authentication (setup, verify, disable, login challenge)
- Active session listing and remote termination
- Secure email-change flow with step-up verification
- Password reset with one-time token protection and replay prevention
- Refresh-token reuse detection
- Account status restrictions (blocked, banned, paused, deactivated)
- Sensitive-route rate limiting and failed-attempt controls
- **30-day recoverable account deletion** — sessions revoked on schedule, signing in again within the window cancels deletion

### AI & Learning
- Learner onboarding: topic + goal → learning level
- AI roadmap generation via BullMQ background job with progress polling
- AI roadmap evaluation with missing-topic detection
- Missing topics insertable into tracker structure
- AI fallback and worker reliability handling

### Tracker
- Full tracker flow implemented
- Evaluation and missing-topic insertion
- Tracker UX and APIs complete

### Dashboard
- Summary widgets and AI insights

### Profile
- Avatar and banner support with AI preview flows

### Settings
- Appearance/theme, notifications, privacy
- Code editor/compiler preferences
- AI behavior and learning preferences
- Gesture settings
- Security page: email management, password management, active sessions, 2FA, account deletion controls

---

## Testing & CI

| Suite | Passing |
|---|---|
| Integration tests (Vitest + Supertest + MongoDB Memory Server) | 18 / 18 |
| Security unit/middleware tests | 19 / 19 |

**Coverage includes:**
- Auth and security-sensitive HTTP flows
- CSRF checks
- Refresh-token rotation and reuse detection
- OAuth state protection
- Request-origin protection
- Password reset replay prevention
- Upload signature validation
- Scheduled account deletion recovery flow

**CI pipelines:** lint, build, dependency review, CodeQL security scanning

---

## What's Next

- Community, challenge, mock test, and social modules
- AI lesson and explanation flows
- Background purge worker for expired 30-day deletion windows
- Expanded automated test coverage as new modules ship
- API docs, database design, and frontend flows kept aligned throughout

---

## Development

```bash
# Install dependencies
npm install

# Run all packages in dev mode
npm run dev

# Build all packages
npm run build

# Lint
npm run lint

# Run tests
npm run test
```

---

*Development started May 6, 2026.*
