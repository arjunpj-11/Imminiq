<div align="center">

# Imminiq

**An AI-powered learning platform — built with strict clean architecture, hardened authentication, personalized roadmaps, interactive lessons, and real-time code execution.**

![Status](https://img.shields.io/badge/status-active%20development-brightgreen?style=flat-square)
![Started](https://img.shields.io/badge/started-May%206%2C%202026-blue?style=flat-square)
![Tests](https://img.shields.io/badge/tests-37%20passing-success?style=flat-square)
![License](https://img.shields.io/badge/license-private-lightgrey?style=flat-square)

</div>

---

## Overview

Imminiq is a full-stack, AI-first learning platform that generates personalized roadmaps, guides learners through structured lessons with AI chat support, and provides an in-browser code execution environment — all within a rigorously architected monorepo.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript |
| Architecture | Modular + Strict Clean Architecture |
| Database | MongoDB Atlas |
| Cache / Sessions | Redis |
| Realtime | Socket.io |
| Background Jobs | BullMQ |
| Code Execution | Piston |
| AI Providers | Groq, Gemini, Cerebras |
| Media | Cloudinary, Cloudflare Images |
| Monorepo | Turborepo + npm workspaces |

---

## Architecture

Each backend feature module follows **Strict Clean Architecture** with a consistent internal structure:

```
src/modules/<feature>/
├── application/      # Use cases, DTOs, service interfaces
├── domain/           # Entities, value objects, domain logic
├── infrastructure/   # DB, cache, queues, external APIs
└── presentation/     # HTTP controllers, routes, middleware
```

**Rules enforced across all modules:**

- Modules never directly access each other's internals
- Dependencies always point inward
- Domain and application layers have zero knowledge of Express, Mongoose, Redis, or BullMQ
- Shared infrastructure lives outside feature modules

---

## What's Built

<details>
<summary><strong>Infrastructure</strong></summary>

- Turborepo monorepo with root-level dev, build, lint, and test scripts
- MongoDB models, Redis cache clients, BullMQ queues and workers
- Socket.io real-time infrastructure
- Cloudinary and Cloudflare image pipelines
- Piston-based code execution service
- Environment-based configuration

</details>

<details>
<summary><strong>Authentication & Security</strong></summary>

- Email and phone registration with OTP (Redis-backed)
- Login, logout, refresh-token rotation, `/me` session restoration
- Google OAuth and GitHub OAuth with cookie-based callback flow
- Two-factor authentication — setup, verify, disable, login challenge, backup codes
- Active session listing and remote session revocation
- Logout from all sessions
- Secure email-change with step-up verification
- Password reset with one-time token protection and replay prevention
- Refresh-token reuse detection
- Account status restrictions: blocked, banned, paused, deactivated, pending deletion
- Sensitive-route rate limiting and failed-attempt controls
- Security audit logging, CSRF protection, request-origin protection
- Encrypted auth-related cookies
- **30-day recoverable account deletion** — signing back in within the recovery window cancels deletion

</details>

<details>
<summary><strong>AI & Learning</strong></summary>

- Learner onboarding with topic and goal setup
- AI-generated learning level assessment
- AI roadmap generation via BullMQ background jobs with progress polling
- Roadmap evaluation and missing-topic detection
- AI visualization generation for lessons (with saved-result reuse)
- Lesson AI chat and question-doubt AI chat
- AI-generated explanations and learning support flows
- Fallback handling and worker reliability improvements

</details>

<details>
<summary><strong>Tracker</strong></summary>

- Full tracker CRUD — create, list, view, update, delete
- Archive/restore, publish/unpublish
- Topic, subtopic, and lesson structure management
- Topic and subtopic progress tracking
- User-specific data isolation
- Last-active tracker logic
- Missing-topic insertion from AI evaluation
- Tracker, topic, and roadmap management UI

</details>

<details>
<summary><strong>Lessons & Practice</strong></summary>

- Lesson page, inline viewer, and AI visualization modal
- Lesson chat and question-doubt chat
- In-lesson code compiler (Piston-backed)
- Submit-only code persistence (not saved on every run)
- Voice typing support for answer and chatbot input with animated listening indicator
- Quick revision flow

</details>

<details>
<summary><strong>Dashboard</strong></summary>

- Summary widgets, AI insights, current roadmap section
- Activity intensity heatmap
- Recent battles and friends hub sections
- Recommended actions
- Skeleton loading for main content (sidebar and topbar preserved)

</details>

<details>
<summary><strong>Profile & Settings</strong></summary>

- Avatar and banner upload (Cloudinary-backed)
- Appearance, notifications, privacy, learning, gesture, and AI behavior settings
- Code editor and compiler preferences
- Email, password, active sessions, 2FA controls, and account deletion controls
- Skeleton loaders for smoother settings UX

</details>

---

## Testing & CI

| Suite | Status |
|---|---|
| Integration tests (Vitest + Supertest + MongoDB Memory Server) | ✅ 18 / 18 |
| Security unit / middleware tests | ✅ 19 / 19 |

**Coverage includes:** auth flows, CSRF, refresh-token rotation, reuse detection, OAuth state protection, request-origin checks, password reset replay prevention, upload signature validation, and the 30-day account deletion recovery flow.

**CI pipelines:** Lint · Build · Test · Dependency Review · CodeQL Security Scanning

---

## Git Workflow

```
feature branches  →  sub-main  →  main
```

Development happens on feature branches or `sub-main`, then merges into `main` after review.

---

## Getting Started

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

**Start local supporting services:**

```bash
# Start Piston (code execution engine)
npm run piston:up
```

> Imminiq requires Redis and Piston running locally during development.

---

## What's Next

- Community module
- Challenge module
- Mock test module
- Social learning and battle improvements
- Background purge worker for expired 30-day deletion windows
- Expanded automated test coverage
- API, database design, and frontend flow documentation
- Full deployment documentation (backend, frontend, Redis, MongoDB, Piston)

---

## Project Timeline

Development started **May 6, 2026**. Currently in active feature development and product module expansion.
