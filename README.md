
## Project Status

Imminiq is now in **active feature development**.

Development officially started on **May 6, 2026**. The project has moved well beyond the initial setup phase and now includes a stable monorepo foundation, core authentication flows, AI-powered onboarding, dashboard features, profile/settings modules, and a stronger security/testing layer.

### Current Progress

* Monorepo architecture configured with **Turborepo + npm workspaces**
* Frontend running with **React + Vite + TypeScript**
* Backend API running with **Express + TypeScript**
* **MongoDB Atlas**, **Redis**, and **Socket.io** integrated
* Backend reorganized toward **Strict Clean Architecture**
* Root-level development, build, lint, and testing scripts configured
* Git workflow using feature branches, `sub-main`, and `main` established

### Authentication & Security

* Email/phone-based registration flow implemented
* OTP verification flow backed by Redis temporary storage
* Login, logout, refresh-token, and `/me` session restoration flows implemented
* Google OAuth and GitHub OAuth integrated
* OAuth callback flow supports cookie-based session restoration instead of exposing tokens in redirect URLs
* Account status restrictions supported for blocked, banned, paused, and deactivated users
* Two-factor authentication setup, verification, disabling, and login challenge flow implemented
* Active session listing and session termination implemented
* Secure email-change flow with step-up verification implemented
* Password reset flow hardened with one-time reset token protection
* Refresh-token reuse detection added
* Sensitive-route rate limiting and failed-attempt controls added
* Account deletion now uses a **30-day recoverable deletion window**

  * deletion is scheduled
  * sessions are revoked
  * signing in again within 30 days cancels the deletion process

### AI & Learning Flow

* Learner onboarding flow implemented:

  * Step 1: topic + goal
  * Step 2: learning level
* AI roadmap generation moved into a **BullMQ background job**
* Job progress polling and result retrieval implemented
* AI roadmap evaluation flow added
* Evaluation results can suggest missing topics for a tracker
* Missing suggested topics can be inserted into the tracker structure
* AI fallback and worker reliability improvements added

### Product Modules in Progress / Implemented

* Dashboard module implemented with summary widgets and AI insights
* User profile module implemented with avatar and banner support
* AI avatar/banner preview flows added
* Settings module implemented:

  * appearance/theme
  * notifications
  * privacy
  * code editor/compiler preferences
  * AI behavior preferences
  * learning preferences
  * gesture settings
* Security settings page implemented with:

  * email management
  * password management
  * active sessions
  * two-factor authentication
  * account deletion controls
* Tracker evaluation and missing-topic insertion flow implemented

### Testing & CI

* CI checks configured for lint and build verification
* Dependency review and CodeQL security scanning configured
* Security-focused Vitest test suite added
* HTTP integration tests implemented with:

  * **Vitest**
  * **Supertest**
  * **MongoDB Memory Server**
* Current automated coverage includes:

  * auth and security-sensitive HTTP flows
  * CSRF checks
  * refresh-token rotation and reuse detection
  * OAuth state protection
  * request-origin protection
  * password reset replay prevention
  * upload signature validation
  * scheduled account deletion recovery flow
* Latest security tests passing:

  * **18/18 integration tests**
  * **19/19 security unit/middleware tests**

### Current Stage

**Core platform foundation, authentication/security hardening, onboarding, dashboard, profile, and settings modules are now in place.**

The project is currently progressing into deeper product-module development and refinement.

### Next Focus Areas

* Complete remaining tracker-related UX and APIs
* Continue community, challenge, mock test, and social modules
* Expand AI lesson/explanation flows
* Add the final background purge worker for accounts whose 30-day deletion window has expired
* Continue strengthening automated testing as new modules are added
* Keep API docs, database design, and frontend flows aligned as the platform grows


