<div align="center">

# Imminiq

**An AI-powered learning platform with personalized roadmaps, interactive lessons, real-time code execution, and a complete Social experience for learning together.**

![Status](https://img.shields.io/badge/status-production%20baseline-brightgreen?style=flat-square)
![Started](https://img.shields.io/badge/started-May%206%2C%202026-blue?style=flat-square)
![Tests](https://img.shields.io/badge/tests-367%20passing-success?style=flat-square)
![License](https://img.shields.io/badge/license-private-lightgrey?style=flat-square)

</div>

---

## Overview

Imminiq is a full-stack, AI-first learning platform that generates personalized roadmaps, guides learners through structured lessons with AI support, provides an in-browser code execution environment, and keeps learners connected through private chat, voice messages, tracker sharing, and contextual audio/video calls.

The platform is organized as a rigorously architected monorepo. Backend capabilities use strict clean architecture, while the frontend exposes cohesive feature modules with stable public boundaries.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript |
| Backend | Express + TypeScript |
| Architecture | Modular + Strict Clean Architecture |
| Database | MongoDB Atlas |
| Cache / Sessions | Redis |
| Realtime | Socket.IO + WebRTC |
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
- Frontend features expose public entry points and do not import another feature's internals

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

- AI-guided tracker creation with goals, level, learning preferences, and preferred language
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
<summary><strong>Social & Communication</strong></summary>

- One responsive Social workspace for chats, friends, requests, and call history
- Separate backend `chat` and `calls` modules with the same strict clean-architecture boundaries as the rest of the API
- Real-time direct messaging, typing indicators, read receipts, online presence, and last activity
- Privacy controls for presence and last-activity visibility
- Voice messages with accurate duration and in-chat playback
- Code snippets with copy actions, image previews, files, forwarding, and media controls
- Public tracker sharing from personal trackers and Community directly into a conversation
- Audio and video calls built on WebRTC with a required call reason, incoming-call context, minimize behavior, outcome tracking, and stored duration
- User blocking that prevents messaging, profile access, avatar visibility, and presence disclosure
- Server-side Groq transcription for consistent voice input across supported product modules

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
| Backend architecture, security, unit, and integration tests | ✅ 303 / 303 |
| Frontend architecture, production configuration, and utility tests | ✅ 64 / 64 |

**Coverage includes:** auth flows, CSRF, refresh-token rotation, reuse detection, OAuth state protection, request-origin checks, password reset replay prevention, upload signature validation, account deletion recovery, module-boundary enforcement, chat and call flows, voice-message duration, tracker sharing, and Social utilities.

**CI pipelines:** Lint · Build · Test · Dependency Review · CodeQL Security Scanning

Production deployment, validation, rollback, secrets, and operations guidance is in [docs/production-deployment.md](docs/production-deployment.md).

---

## Git Workflow

```
feature branches  →  sub-main  →  main
```

Development happens on feature branches or `sub-main`, then merges into `main` after review.

---

## Getting Started

### Prerequisites

- Node.js and npm (the repository uses npm `10.9.0`)
- Docker with Docker Compose for the local Piston and Redis services
- A MongoDB instance, either local or hosted

### Installation

```bash
# Install dependencies for every workspace
npm install

# Create local environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.development

# Start the API, web app, Piston, and local Redis
npm run dev
```

Fill in the required values in the copied environment files before starting the application. The API and web app templates document the variables each workspace expects.

### Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start all workspaces with local Piston and Redis |
| `npm run dev:web` | Start only the frontend |
| `npm run dev:api` | Start the API and Piston |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run all test suites |
| `npm run check` | Run linting, tests, and production builds |
| `npm run piston:up` | Start the local Piston service |
| `npm run piston:down` | Stop the local Piston service |
| `npm run services:up` | Start the local Piston and Redis services |
| `npm run services:down` | Stop the local Docker services |

> `npm run dev` and `npm run dev:api` use the local Docker Redis instance even when `apps/api/.env` contains a hosted `REDIS_URL`. Production continues to use its configured managed Redis service.

### Workspace Layout

```text
Imminiq/
├── apps/
│   ├── api/       # Express API, workers, and backend modules
│   └── web/       # React and Vite frontend
├── docs/          # Deployment and operations documentation
├── scripts/       # Repository automation and smoke tests
└── docker-compose.yml
```

---

## What's Next

- Production TURN capacity and regional call-quality monitoring
- Deeper Social notification and call-recovery resilience
- Expanded automated test coverage
- API, database design, and frontend flow documentation

---

## Project Timeline

Development started **May 6, 2026**. Imminiq is currently a production-ready baseline under active feature development and operational hardening.
