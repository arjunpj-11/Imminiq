<div align="center">

# Imminiq

**An AI-powered, community-driven learning platform that turns a learning goal into a structured path—and improves that path through real learner contributions.**

[![Project Status](https://img.shields.io/badge/project-completed-brightgreen?style=flat-square)](#project-status)
[![Tests](https://img.shields.io/badge/automated_tests-497-success?style=flat-square)](#quality-engineering)
[![Architecture](https://img.shields.io/badge/architecture-strict_clean_architecture-blue?style=flat-square)](#architecture)
[![License](https://img.shields.io/badge/license-private-lightgrey?style=flat-square)](#project-status)

[Live Application](https://imminiq.arjunpj.online) · [Architecture](#architecture) · [Features](#product-capabilities) · [Run Locally](#getting-started)

</div>

---

## Overview

Imminiq is a completed, production-oriented full-stack learning platform built to solve a common problem in self-directed education: learners often spend more time deciding **what to learn and in what order** than actually learning.

The platform converts a learner's goal, experience level, preferences, and language into a structured tracker of topics, subtopics, and lessons. AI creates the initial roadmap, while community contributions, verification workflows, moderation, and shared learning spaces help keep published trackers useful over time.

Imminiq goes beyond roadmap generation. It combines adaptive learning, AI-assisted lessons, mock tests, progress analytics, community verification, rewards, real-time messaging, voice and video calls, subscriptions, support workflows, and a role-aware administration console in one cohesive product.

> **AI creates the starting path. Learners make it better together.**

## The Problem and the Solution

Self-learners typically piece together documentation, videos, courses, and search results before they can form a reliable study plan. That process is slow, inconsistent, and can leave important knowledge gaps. A roadmap produced only by AI is faster, but it can still be incomplete or outdated.

Imminiq combines the strengths of both approaches:

```text
Learning goal and preferences
            ↓
AI-generated structured tracker
            ↓
Lessons, practice, and progress tracking
            ↓
Community contributions and verification
            ↓
Moderated, continuously improved learning paths
```

AI provides speed and structure. The community contributes practical experience, corrections, missing concepts, and verification.

## Product Capabilities

| Area                          | What Imminiq delivers                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI learning paths**         | Guided tracker creation, level assessment, roadmap generation, structural evaluation, missing-topic detection, and provider fallback                                |
| **Learning workspace**        | Topic and lesson management, progress tracking, contextual AI help, saved content, revision flows, voice input, and code execution                                  |
| **Adaptive learning**         | Learner profiles, mastery tracking, personalized assessments, targeted recommendations, and an adaptive learning agent                                              |
| **Mock tests**                | AI-assisted test generation, timed attempts, result analysis, question review, issue reporting, and administrative question-bank moderation                         |
| **Community learning**        | Public trackers, personal clones, topic contributions, verification queues, reviewer rewards, rankings, reports, and moderation appeals                             |
| **Tracker clans**             | Shared tracker communities, guild chat, learner challenges, battle flows, collaboration, and contribution coordination                                              |
| **Social experience**         | Friend discovery, requests, direct messages, presence, read receipts, voice messages, file and code sharing, and profile sharing                                    |
| **Real-time calls**           | WebRTC audio and video calls, call context, minimized call UI, history, duration tracking, and expiring TURN credentials                                            |
| **Accounts and security**     | Email and phone verification, OAuth, two-factor authentication, recovery codes, session management, security logs, and recoverable deletion                         |
| **Subscriptions and support** | Plan-based feature limits, subscription management, Razorpay integration, support tickets, and notification workflows                                               |
| **Administration**            | User and content moderation, tracker and mock-test review, analytics, broadcasts, audit logs, system health, subscription controls, AI spend, and platform settings |

<details>
<summary><strong>AI, trackers, and lessons</strong></summary>

- Guided tracker creation using learning goal, experience level, preferences, and language
- AI-generated learning-level assessment and structured roadmap generation
- BullMQ background jobs with generation-status polling
- Multi-provider AI routing across Groq, Gemini, and Cerebras
- Provider fallback for quota, availability, and invalid structured responses
- Manual tracker creation and outline import
- Topic, subtopic, and lesson management
- Tracker publishing, cloning, archiving, restoring, and public sharing
- Roadmap evaluation and missing-topic insertion
- Lesson-context chat and doubt resolution
- AI-generated explanations and reusable lesson visualizations
- Relevant learning-video discovery
- Quick revision flows and voice input
- Piston-backed in-browser code execution with explicit submission persistence

</details>

<details>
<summary><strong>Community, assessment, and engagement</strong></summary>

- Community discovery with personalized tracker results
- Personal learning clones of published trackers
- Topic contribution and owner-review workflows
- Community verification queues and reward calculation
- Leaderboards, reviewer earnings, and contribution recognition
- Tracker reports, content moderation, and appeal workflows
- Tracker clans with membership, chat, challenges, and battle activity
- AI-generated mock tests with background generation
- Timed attempts, scoring, result breakdowns, and performance analysis
- Adaptive learner profiles, mastery signals, and personalized assessments
- Activity tracking, learning heatmaps, dashboard insights, and notifications

</details>

<details>
<summary><strong>Communication and collaboration</strong></summary>

- Friend search, invitations, acceptance, removal, and blocking
- Real-time direct messaging with typing indicators and read receipts
- Online presence and privacy-aware last-active visibility
- Voice messages with accurate duration and in-chat playback
- Image, file, code-snippet, tracker, and profile sharing
- Message forwarding, starring, and user-specific chat clearing
- WebRTC audio and video calls
- Required call reason and incoming-call context
- Minimized call experience, outcome tracking, and call history
- Public STUN and server-issued expiring TURN credentials
- Server-side voice transcription

</details>

<details>
<summary><strong>Security, operations, and administration</strong></summary>

- Email and phone registration with Redis-backed OTP verification
- Google and GitHub OAuth with one-time state protection
- Short-lived access tokens and rotating refresh tokens
- Refresh-token reuse detection and token-hash storage
- Two-factor authentication, backup codes, and staff MFA enforcement
- Active-session visibility, individual revocation, and global logout
- Step-up verification for sensitive account and administrative actions
- CSRF, origin, upload-signature, rate-limit, and input-validation protections
- Password-reset replay prevention and failed-attempt controls
- Account-state enforcement for blocked, banned, paused, and deletion-pending users
- Recoverable account deletion with a 30-day recovery period
- Role- and permission-aware administration routes
- User, tracker, mock-test, subscription, and support-ticket management
- Platform analytics, broadcast notifications, audit logs, and system health
- Runtime feature availability controls and AI-token-spend reporting

</details>

## Architecture

Imminiq is a TypeScript monorepo with separate React and Express applications. The backend uses **Strict Clean Architecture**, and both applications enforce feature boundaries through automated architecture tests.

```text
React PWA
  ├── Feature modules and route groups
  ├── TanStack Query server state
  ├── Zustand client state
  └── Socket.IO and WebRTC clients
                  │
                  ▼
Express API and Socket.IO gateway
  ├── Presentation     HTTP routes, validation, and middleware
  ├── Application      Use cases, DTOs, ports, and orchestration
  ├── Domain           Entities, value objects, and business rules
  └── Infrastructure   MongoDB, Redis, queues, AI, storage, and payments
                  │
       ┌──────────┼───────────┬───────────┐
       ▼          ▼           ▼           ▼
   MongoDB      Redis       BullMQ     External services
```

Each backend feature follows the same inward-facing dependency structure:

```text
src/modules/<feature>/
├── application/      # Use cases, DTOs, and service interfaces
├── domain/           # Entities, value objects, and business rules
├── infrastructure/   # Persistence and external-service adapters
└── presentation/     # Controllers, routes, schemas, and middleware
```

### Architectural Principles

- Business rules remain independent of Express, Mongoose, Redis, and third-party SDKs.
- Feature modules communicate through explicit public contracts rather than private imports.
- Dependencies point inward toward application and domain code.
- Long-running AI work is handled asynchronously through BullMQ workers.
- Server state, global client state, and URL state have clearly separated owners.
- Routes are lazy-loaded and grouped by public, authenticated, focused-workspace, and administration contexts.
- Architecture tests prevent accidental cross-module coupling on both frontend and backend.

## Engineering Highlights

### Reliable AI orchestration

AI workloads use operation-specific model chains instead of depending on a single provider. The orchestration layer can move between Groq, Gemini, and Cerebras when it encounters quota limits, unavailable models, or invalid structured output. Expensive generation tasks run in background workers, while clients receive progress and completion states.

### Community data without shared-progress conflicts

Published trackers act as discoverable source material, while learners work through personal clones. This preserves individual progress and customization without mutating another learner's tracker. Contributions and reusable lesson content are coordinated through explicit review and synchronization flows.

### Security designed into the application boundary

Imminiq combines rotating refresh tokens, reuse detection, CSRF protection, request-origin checks, OAuth state validation, rate limiting, two-factor authentication, step-up verification, account-state enforcement, safe DTO mapping, and audit logging. Privileged administration routes require staff MFA and granular permissions.

### Real-time learning and communication

Socket.IO coordinates messaging, typing, presence, tracker-clan chat, notifications, and call signaling. WebRTC handles audio and video media, with server-issued expiring TURN credentials for production connectivity.

### Production delivery

The repository includes infrastructure and deployment automation for AWS. GitHub Actions builds and verifies the monorepo, publishes the frontend PWA, pushes the backend container to ECR, restarts production services through AWS Systems Manager, and performs HTTP and real-browser health checks after deployment.

## Technology Stack

| Layer                   | Technology                                                    |
| ----------------------- | ------------------------------------------------------------- |
| Frontend                | React 19, TypeScript, Vite, React Router                      |
| UI and styling          | Tailwind CSS 4, Lucide React                                  |
| Server state            | TanStack Query                                                |
| Client state            | Zustand                                                       |
| Backend                 | Node.js, Express 5, TypeScript                                |
| Architecture            | Modular Strict Clean Architecture                             |
| Validation              | Zod                                                           |
| Database                | MongoDB with Mongoose                                         |
| Cache and sessions      | Redis with ioredis                                            |
| Background processing   | BullMQ                                                        |
| Real-time communication | Socket.IO, WebRTC                                             |
| AI providers            | Groq, Gemini, Cerebras                                        |
| Code execution          | Piston                                                        |
| Media                   | Cloudinary, Cloudflare Images                                 |
| Payments                | Razorpay                                                      |
| Monorepo                | Turborepo, npm workspaces                                     |
| Testing                 | Vitest, Supertest, Playwright, MongoDB Memory Server          |
| Infrastructure          | AWS CloudFormation, EC2, ECR, S3, CloudFront, Systems Manager |
| Delivery and security   | GitHub Actions, CodeQL, dependency review, Docker             |

## Quality Engineering

The repository contains **497 automated test cases** across frontend and backend suites.

| Suite                                                 | Test cases |
| ----------------------------------------------------- | ---------: |
| Backend architecture, security, unit, and integration |        336 |
| Frontend architecture, configuration, and utility     |        161 |
| **Total**                                             |    **497** |

Coverage includes:

- Authentication, OAuth, token rotation, token reuse, and account recovery
- CSRF, request-origin, rate-limit, upload-signature, and DTO protections
- AI fallback, structured-response validation, quotas, and background jobs
- Trackers, contributions, community verification, clans, and shared lessons
- Adaptive learning, mock tests, moderation, rewards, and subscriptions
- Chat, calls, privacy-aware presence, and social workflows
- Administration permissions, step-up authentication, exports, and moderation
- Frontend and backend module-boundary enforcement
- Production configuration, PWA behavior, and browser smoke tests

Every pull request and protected-branch update runs:

```text
Formatting → Linting → Unit and integration tests → Production build
           → Dependency review → CodeQL analysis → Browser smoke tests
```

## Production Infrastructure

The production design uses:

- A React PWA delivered from S3 through CloudFront
- A Dockerized Express API hosted on EC2
- ECR for backend container images
- Redis and Piston services alongside the API host
- MongoDB Atlas for application persistence
- AWS Systems Manager for deployment access without SSH
- GitHub OpenID Connect for short-lived AWS deployment credentials
- Doppler-backed production secret management
- Health endpoints and Playwright checks after each deployment

Infrastructure templates and operational documentation live under [`infra/aws`](./infra/aws).

## Getting Started

### Prerequisites

- Node.js 22
- npm `10.9.0`
- Docker and Docker Compose
- A local or hosted MongoDB instance
- Credentials for the external services used by the features you want to run

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Enter the monorepo
cd Imminiq

# Install all workspace dependencies
npm install

# Create local environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.development

# Start the web app, API, Redis, and Piston
npm run dev
```

Complete the copied environment files before starting the application. The templates describe the required and optional configuration for each workspace.

## Useful Commands

| Command                                     | Purpose                                      |
| ------------------------------------------- | -------------------------------------------- |
| `npm run dev`                               | Start the full local development environment |
| `npm run dev:web`                           | Start the frontend workspace                 |
| `npm run dev:api`                           | Start the API with its local services        |
| `npm run build`                             | Build both workspaces                        |
| `npm run format`                            | Format supported repository files            |
| `npm run format:check`                      | Check formatting without changing files      |
| `npm run lint`                              | Lint both workspaces                         |
| `npm run test`                              | Run all Vitest suites                        |
| `npm run check`                             | Run formatting, linting, tests, and builds   |
| `npm run test:e2e --workspace=@imminiq/web` | Run Playwright browser tests                 |
| `npm run services:up`                       | Start Redis and Piston                       |
| `npm run services:down`                     | Stop the local Docker services               |

## Repository Structure

```text
Imminiq/
├── apps/
│   ├── api/                 # Express API, Socket.IO, workers, and backend modules
│   └── web/                 # React PWA and frontend feature modules
├── docs/                    # Architecture, security, and operations documentation
├── infra/aws/               # CloudFormation and AWS deployment resources
├── .github/workflows/       # CI, security scanning, and production deployment
├── docker-compose.yml       # Local Redis and Piston services
└── package.json             # Monorepo scripts and workspace configuration
```

## Project Status

**Imminiq is complete.**

The repository contains the finished application, frontend and backend architecture, automated tests, security controls, administration tooling, production infrastructure, and continuous-delivery workflows. Development began on **May 6, 2026**, and the completed project represents an end-to-end implementation of the original AI-assisted, community-evolving learning-platform vision.

This is a private repository. All rights are reserved.

---

<div align="center">

### AI creates the starting path. Learners make it better together.

</div>
