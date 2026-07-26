<div align="center">

# Imminiq

**A community-evolving learning platform where AI creates the starting path and learners continuously make it better.**

![Status](https://img.shields.io/badge/status-production%20baseline-brightgreen?style=flat-square)
![Started](https://img.shields.io/badge/started-May%206%2C%202026-blue?style=flat-square)
![Tests](https://img.shields.io/badge/tests-444%20passing-success?style=flat-square)
![License](https://img.shields.io/badge/license-private-lightgrey?style=flat-square)

</div>

---

## Overview

Imminiq is a full-stack, AI-assisted learning platform designed to make self-learning more structured, collaborative, and reliable.

When people begin learning a new subject, they often spend significant time searching through documentation, videos, courses, websites, and scattered resources just to understand what they need to study. Even after that research, important topics may still be missed.

AI can generate a roadmap quickly, but an AI-generated roadmap alone may be incomplete, inaccurate, or outdated.

Imminiq uses AI as the **starting point**, not the final authority.

The platform generates a structured learning tracker containing the topics, subtopics, and lessons required to achieve a particular learning goal. Learners following the same tracker can study together, discuss concepts, share resources, challenge one another, and suggest improvements.

The long-term community model allows proposed changes to be reviewed and verified before becoming part of the shared tracker. As more learners complete and improve a tracker, it becomes increasingly complete and reliable for the people who follow it next.

> **AI starts the learning path. The community continuously improves it.**

Alongside structured trackers, Imminiq provides interactive lessons, contextual AI assistance, progress tracking, real-time communication, collaborative tracker sharing, and an in-browser code execution environment.

---

## The Story Behind Imminiq

Imminiq began with a personal full-stack study tracker created to prepare for a development exam.

The original tracker organized the concepts required to learn modern full-stack development, including JavaScript, React, TypeScript, data structures, algorithms, and related web-development topics.

After other learners requested similar trackers for subjects such as Python, Django, and additional technology stacks, a larger opportunity became clear:

Instead of manually creating a separate tracker for every subject, a platform could generate an initial learning structure automatically and allow the people studying through it to improve it together.

That idea became Imminiq.

What started as a personal study tool has evolved into a larger AI-first learning ecosystem with modular architecture, real-time collaboration, secure authentication, social communication, background processing, and interactive practice.

---

## Core Product Model

Imminiq is built around a continuously evolving learning cycle:

```text
Learning goal
    ↓
AI-generated tracker
    ↓
Structured topics, subtopics, and lessons
    ↓
Learners study and collaborate
    ↓
Missing or outdated content is identified
    ↓
Improvements are reviewed and verified
    ↓
The tracker becomes better for future learners
```

The tracker and its learning community evolve together.

AI provides speed and structure, while the community contributes practical experience, corrections, missing concepts, and updated knowledge.

---

## Current Implementation and Product Direction

The current production baseline includes:

- AI-assisted tracker and roadmap generation
- Structured topic, subtopic, and lesson management
- Contextual AI support for lessons and questions
- Progress tracking and activity insights
- Direct messaging and real-time communication
- Public tracker sharing
- Audio and video calls
- In-browser code execution
- Hardened authentication and account security
- Modular Clean Architecture
- Automated architecture, security, unit, and integration tests

The production baseline also includes community tracker contributions, verification voting,
reviewer rewards, moderation, and learning guild collaboration.

---

## Tech Stack

| Layer                   | Technology                        |
| ----------------------- | --------------------------------- |
| Frontend                | React, Vite, TypeScript           |
| Backend                 | Express, TypeScript               |
| Architecture            | Modular Strict Clean Architecture |
| Database                | MongoDB Atlas                     |
| Cache and Sessions      | Redis                             |
| Real-Time Communication | Socket.IO, WebRTC                 |
| Background Jobs         | BullMQ                            |
| Code Execution          | Piston                            |
| AI Providers            | Groq, Gemini, Cerebras            |
| Media                   | Cloudinary, Cloudflare Images     |
| Monorepo                | Turborepo, npm workspaces         |

---

## Architecture

Imminiq is organized as a modular monorepo with independently structured frontend and backend applications.

Each backend feature follows **Strict Clean Architecture**:

```text
src/modules/<feature>/
├── application/      # Use cases, DTOs, and service interfaces
├── domain/           # Entities, value objects, and domain rules
├── infrastructure/   # Database, cache, queues, and external services
└── presentation/     # HTTP controllers, routes, and middleware
```

### Architecture Rules

- Feature modules cannot directly access another module’s internal implementation
- Dependencies point inward toward the domain
- Domain and application layers have no knowledge of Express, Mongoose, Redis, or BullMQ
- External services are accessed through interfaces defined by inner layers
- Shared infrastructure remains outside individual feature modules
- Frontend features expose stable public entry points
- Frontend modules cannot import another feature’s private internals
- Architecture boundaries are enforced through automated tests

This structure keeps business logic independent from frameworks and makes individual modules easier to test, maintain, replace, and scale.

---

## What’s Built

<details>
<summary><strong>Infrastructure and Monorepo</strong></summary>

- Turborepo monorepo with npm workspaces
- Root-level development, build, lint, and test scripts
- MongoDB persistence and data models
- Redis caching and session infrastructure
- BullMQ queues and background workers
- Socket.IO real-time infrastructure
- Cloudinary and Cloudflare image pipelines
- Piston-based code execution service
- Environment-specific configuration
- Local Docker services for Redis and Piston

</details>

<details>
<summary><strong>Authentication and Security</strong></summary>

- Email and phone registration with Redis-backed OTP verification
- Login, logout, and authenticated session restoration
- Refresh-token rotation
- Refresh-token reuse detection
- Google OAuth
- GitHub OAuth
- Cookie-based OAuth callback flow
- Two-factor authentication setup, verification, and removal
- Two-factor login challenges
- Backup recovery codes
- Active-session listing
- Remote session revocation
- Logout from all sessions
- Secure email changes with step-up verification
- Password reset with one-time token protection
- Password-reset replay prevention
- Account restrictions for blocked, banned, paused, deactivated, and deletion-pending users
- Sensitive-route rate limiting
- Failed-attempt controls
- CSRF protection
- Request-origin protection
- Security audit logging
- Encrypted authentication cookies
- Recoverable account deletion with a 30-day recovery period
- Automatic cancellation of deletion when the user signs in during the recovery window

</details>

<details>
<summary><strong>AI and Learning</strong></summary>

- AI-guided tracker creation
- Goal, experience-level, learning-preference, and language selection
- AI-generated learning-level assessment
- AI roadmap generation through BullMQ background jobs
- Roadmap-generation progress polling
- Roadmap evaluation
- Missing-topic detection
- Missing-topic insertion
- Lesson-context AI chat
- Question and doubt-resolution AI chat
- AI-generated explanations
- AI-generated lesson visualizations
- Saved visualization reuse
- Provider fallback handling
- Background-worker reliability improvements

</details>

<details>
<summary><strong>Trackers and Roadmaps</strong></summary>

- Create, view, update, and delete trackers
- List user trackers
- Archive and restore trackers
- Publish and unpublish trackers
- Topic, subtopic, and lesson management
- Topic-level progress tracking
- Subtopic-level progress tracking
- User-specific data isolation
- Last-active tracker handling
- AI-assisted roadmap evaluation
- Missing-topic insertion from roadmap evaluations
- Tracker-management interface
- Topic-management interface
- Roadmap-management interface
- Public tracker sharing

</details>

<details>
<summary><strong>Lessons and Practice</strong></summary>

- Structured lesson pages
- Inline lesson viewer
- AI visualization modal
- Lesson-context chat
- Question and doubt chat
- Piston-backed code compiler
- In-browser code execution
- Submit-only code persistence
- Code is not saved automatically on every run
- Voice typing for answers and chatbot input
- Animated voice-listening indicator
- Quick revision flow

</details>

<details>
<summary><strong>Dashboard and Progress</strong></summary>

- Learning summary widgets
- AI-generated insights
- Current-roadmap section
- Activity-intensity heatmap
- Recent battle activity
- Friends hub
- Recommended learning actions
- Progress indicators
- Skeleton loading for primary dashboard content
- Persistent sidebar and topbar during loading

</details>

<details>
<summary><strong>Social Learning and Communication</strong></summary>

- Responsive social workspace for chats, friends, requests, and call history
- Separate backend chat and call modules
- Strict Clean Architecture boundaries for communication modules
- Real-time direct messaging
- Typing indicators
- Read receipts
- Online presence
- Last-activity visibility
- Privacy controls for presence and activity
- Voice messages
- Accurate voice-message duration
- In-chat voice-message playback
- Code-snippet sharing
- Copy actions for shared code
- Image previews
- File sharing
- Message forwarding
- Media controls
- Tracker sharing inside conversations
- Tracker sharing from personal trackers and community surfaces
- WebRTC audio calls
- WebRTC video calls
- Required call reason and incoming-call context
- Minimized call interface
- Call-outcome tracking
- Stored call duration
- Server-issued expiring TURN credentials
- Public STUN configuration
- User blocking
- Blocking protection for messaging, profile access, avatars, and presence
- Server-side Groq transcription for consistent voice input

</details>

<details>
<summary><strong>Profile and Settings</strong></summary>

- Cloudinary-backed avatar uploads
- Banner uploads
- Appearance preferences
- Notification preferences
- Privacy settings
- Learning preferences
- Gesture preferences
- AI-behavior settings
- Code-editor preferences
- Compiler preferences
- Email management
- Password management
- Active-session controls
- Two-factor authentication controls
- Account-deletion controls
- Skeleton loaders for settings interfaces

</details>

---

## Testing and Continuous Integration

| Test Suite                                                  | Status       |
| ----------------------------------------------------------- | ------------ |
| Backend architecture, security, unit, and integration tests | ✅ 331 / 331 |
| Frontend architecture, configuration, and utility tests     | ✅ 113 / 113 |
| Total                                                       | ✅ 444 / 444 |

### Coverage Includes

- Authentication flows
- CSRF protection
- Refresh-token rotation
- Refresh-token reuse detection
- OAuth state protection
- Request-origin checks
- Password-reset replay prevention
- Upload-signature validation
- Account-deletion recovery
- Backend module-boundary enforcement
- Frontend feature-boundary enforcement
- Chat flows
- Call flows
- Voice-message duration
- Tracker sharing
- Social workspace utilities
- Production configuration

### CI Pipelines

```text
Format
Lint
Build
Test
Dependency Review
CodeQL Security Scanning
```

Production deployment, validation, rollback, secrets, and operational guidance are documented in:

```text
docs/production-deployment.md
```

---

## Git Workflow

```text
feature branches  →  sub-main  →  main
```

Development takes place on dedicated feature branches or `sub-main`.

Changes are merged into `main` after review, testing, and validation.

---

## Getting Started

### Prerequisites

- Node.js
- npm `10.9.0`
- Docker
- Docker Compose
- A local or hosted MongoDB instance

Docker is used for the local Redis and Piston services.

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Enter the project directory
cd Imminiq

# Install dependencies for all workspaces
npm install

# Create local environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.development

# Start the API, web application, Piston, and Redis
npm run dev
```

Add the required environment variables to the copied files before starting the application.

The API and frontend environment templates document the configuration expected by each workspace.

---

## Useful Commands

| Command                 | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Start all workspaces with local Piston and Redis |
| `npm run dev:web`       | Start only the frontend                          |
| `npm run dev:api`       | Start the API and Piston                         |
| `npm run build`         | Build all workspaces                             |
| `npm run format`        | Format supported repository files                |
| `npm run format:check`  | Verify formatting without changing files         |
| `npm run lint`          | Lint all workspaces                              |
| `npm run test`          | Run all test suites                              |
| `npm run check`         | Run formatting, linting, tests, and builds       |
| `npm run piston:up`     | Start the local Piston service                   |
| `npm run piston:down`   | Stop the local Piston service                    |
| `npm run services:up`   | Start the local Piston and Redis services        |
| `npm run services:down` | Stop the local Docker services                   |

> `npm run dev` and `npm run dev:api` use the local Docker Redis instance even when `apps/api/.env` contains a hosted `REDIS_URL`. Production environments continue to use their configured managed Redis service.

---

## Workspace Layout

```text
Imminiq/
├── apps/
│   ├── api/       # Express API, workers, and backend modules
│   └── web/       # React and Vite frontend
├── docs/          # Deployment and operational documentation
├── scripts/       # Repository automation and smoke tests
└── docker-compose.yml
```

---

## Roadmap

### Community-Evolving Trackers

- Tracker-based learning communities
- Structured suggestions for missing or outdated topics
- Community review and verification workflows
- Contribution histories
- Contributor recognition
- Tracker versioning
- Change discussions
- Trust and reputation mechanisms
- Protection against low-quality or malicious contributions
- Community-maintained learning resources

### Learning Experience

- Deeper collaborative lesson discussions
- Shared study sessions
- Better AI-generated visual learning materials
- Expanded assessment and revision systems
- Improved learner recommendations
- Stronger personalization based on progress and activity

### Platform and Operations

- Production TURN capacity
- Regional call-quality monitoring
- Improved call-recovery resilience
- Deeper social-notification reliability
- Expanded automated test coverage
- API documentation
- Database-design documentation
- Frontend-flow documentation
- Performance and observability improvements

---

## Project Timeline

Development began on **May 6, 2026**.

Imminiq is currently a production release candidate prepared for final review.

The current platform establishes the technical and product foundation for a larger community-driven learning ecosystem where structured trackers improve through the combined strengths of AI and human experience.

---

## Project Status

Imminiq is a private production release candidate. The repository includes the application,
architecture safeguards, release documentation, and operational checks required for review.

---

<div align="center">

### AI creates the starting path. Learners make it better together.

</div>
