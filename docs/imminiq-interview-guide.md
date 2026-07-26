# Imminiq interview guide

## One-line explanation

Imminiq is an AI-assisted, community-evolving learning platform that turns a learner's goal into a
structured tracker and then combines guided lessons, practice, progress analytics, and social
learning to help the learner reach mastery.

## Short interview pitch

People who want to learn a subject usually waste time collecting disconnected courses, videos,
documentation, and practice material. A generative AI can create a roadmap quickly, but its answer
may be incomplete or become outdated.

Imminiq solves both problems. AI creates the initial learning tracker with topics, subtopics, and
lessons. The learner studies through that structure, receives contextual help from Ask Immi,
practices with mock tests and an in-browser compiler, and sees measurable progress. Learners can
also publish trackers, join learning guilds, communicate in real time, and propose improvements.
Community verification and administration protect the quality of shared content.

The product principle is:

> AI creates the starting path. Learners make it better together.

## Why the project exists

Imminiq began as a personal full-stack study tracker. When other learners wanted similar trackers
for different technologies, manually creating every roadmap was no longer practical. The project
became a platform that could generate the first structure automatically while allowing real
learners to improve it over time.

The main goals are:

1. Reduce the time required to decide what to learn.
2. Prevent important topics from being missed.
3. Turn passive content consumption into measurable mastery.
4. Combine AI speed with human verification and experience.
5. Make self-learning collaborative without exposing private user data.

## Main learner journey

1. The learner registers with email or phone, verifies the account, and completes secure sign-in.
2. The learner describes a goal, experience level, preferences, and available study time.
3. AI generates a tracker and a structured roadmap in a background job.
4. The learner studies topics, subtopics, and lessons and records progress.
5. Ask Immi provides lesson-aware explanations, hints, doubt resolution, and visualizations.
6. The learner practices through questions, mock tests, quick revision, voice input, and code
   execution.
7. Dashboard analytics show mastery, activity, streaks, recommended actions, and current progress.
8. The learner can publish or share a tracker, join its guild, communicate with others, participate
   in challenges, and contribute improvements.
9. Community and admin verification protect public quality.

## Major product areas

### Trackers and learning roadmaps

- AI-guided and manual tracker creation
- topics, subtopics, lessons, and progress
- archive, restore, publish, unpublish, clone, and share workflows
- roadmap evaluation and missing-topic insertion
- topic contributions and review
- tracker guilds, messages, member roles, challenges, and battles
- quick revision and lesson navigation

### Lessons and practice

- contextual Ask Immi conversations
- generated practice questions and explanations
- lesson visualizations
- answer verification and feedback
- voice input and transcription
- Piston-backed code execution
- saved code submissions, history, hints, and optimized solutions

### Mock tests and adaptive learning

- AI-generated tests with controlled question types and difficulty
- timed attempts and saved answers
- coding questions
- results, question analysis, and performance insights
- question reporting and admin moderation
- adaptive assessments, mastery tracking, and recommended next actions

### Community and social learning

- public tracker discovery
- likes, reviews, ratings, and cloning
- community verification with reviewer rewards
- friends, requests, profiles, blocking, and privacy controls
- direct messages, replies, reactions, edits, deletion, forwarding, and saved messages
- files, images, voice messages, profiles, and trackers shared inside conversations
- presence, typing indicators, and read receipts
- WebRTC audio/video calls with server-issued TURN credentials

### User account and settings

- profile, avatar, banner, preferences, and privacy
- notification controls
- saved trackers and lessons
- subscriptions and plan limits
- support tickets
- account export, correction, deletion, and recovery workflows

### Administration

- user search, status, roles, notes, appeals, privacy requests, and step-up protected actions
- tracker review, reports, lifecycle control, publication oversight, and public preview
- mock-test reports, question-bank moderation, and test lifecycle control
- subscriptions, plan definitions, pricing, limits, and propagation
- broadcasts, polls, support tickets, audit logs, AI token usage, queues, and system health
- platform feature availability controls synchronized with backend enforcement and frontend route
  blocking

Private messages, calls, saved items, and device-local information are intentionally not exposed as
admin content.

## How admin and learner experiences stay synchronized

The API is the authority for feature availability. Admin settings update the platform policy stored
in MongoDB. The API middleware blocks disabled capabilities even when a client attempts to call an
endpoint directly. The frontend loads the same policy and removes or blocks the corresponding
navigation, pages, and actions.

Dependent settings are also enforced. For example, tracker creation cannot remain available when
trackers are paused, and calls cannot remain available when the social workspace is paused.

This gives two layers of protection:

```text
Admin policy
    → frontend route and action availability
    → backend endpoint enforcement
```

The frontend improves the user experience; the backend remains the security boundary.

## Technical architecture

Imminiq is an npm-workspace and Turborepo monorepo with two applications:

- `apps/web`: React, Vite, TypeScript, TanStack Query, Zustand, Socket.IO client, and WebRTC
- `apps/api`: Express, TypeScript, MongoDB/Mongoose, Redis, BullMQ, Socket.IO, and external provider
  adapters

Each backend feature follows four layers:

```text
presentation → application → domain
                     ↑
              infrastructure
```

- Domain contains entities, value objects, policies, and repository interfaces.
- Application contains single-purpose use cases, DTOs, and inward-facing service contracts.
- Infrastructure implements persistence, queues, caching, cryptography, AI, payments, storage, and
  real-time adapters.
- Presentation owns HTTP validation, controllers, middleware, and routes.
- Factories are composition roots that connect interfaces to implementations.

The frontend is organized by feature modules. A module exposes a public `index.ts`; other modules
cannot import its private internals. Globally reusable UI lives under `src/components`.

Automated architecture tests enforce these rules. They check layer direction, module structure,
public APIs, DTO ownership, one use-case implementation per file, one execute contract and
implementation per use case, centralized query keys, route registries, reusable admin components,
and separation of API orchestration from React components.

## Important engineering decisions

### AI is not the final authority

AI results are validated, provider fallbacks are supported, public content can be reported and
reviewed, and community contributions require verification. This reduces the risk of confidently
wrong generated content.

### Long-running AI work uses queues

Roadmap and assessment generation can exceed a normal HTTP request duration. BullMQ stores the job,
workers execute it, and the frontend observes progress. Retries and backoff make these workflows
more reliable.

### Server state and client state are separated

TanStack Query owns API data and cache invalidation. Zustand owns local interface/session state.
Query-key factories prevent cache inconsistency.

### Real-time events do not replace persistence

MongoDB remains authoritative. Socket.IO distributes changes quickly, while refetch and recovery
paths protect users after reconnects or missed events.

### Configuration is validated at startup

Deploy-time values live in environment variables with safe fallbacks and bounds. Secrets stay on
the API. Browser-exposed `VITE_*` values contain only public configuration. Business invariants and
security rules remain in code so an unsafe environment value cannot disable them.

## Security model

Imminiq uses defense in depth:

- short-lived access tokens and rotating refresh tokens
- reuse detection and server-side session revocation
- secure, HTTP-only cookies
- CSRF and request-origin validation
- OAuth state validation and canonical callback origins
- two-factor authentication and recovery codes
- step-up passwords for consequential admin actions
- brute-force and Redis-backed rate limiting
- strict input validation and bounded uploads
- TLS requirements for production dependencies
- encrypted TOTP secrets
- password hashing with production minimums
- user blocking and data-isolation checks
- CSP, HSTS, frame protection, referrer policy, and permissions policy
- no-store API responses
- privacy-safe structured error and request logging
- CodeQL, dependency review, architecture tests, security tests, and integration tests

The design assumes the browser can be manipulated, so permissions and feature pauses are always
enforced again on the API.

## Reliability and production operations

- liveness and dependency-aware readiness endpoints
- graceful shutdown of HTTP, Socket.IO, workers, Redis, and MongoDB
- queue retry, backoff, and failed-job visibility
- provider fallback for AI operations
- structured client and server error events
- production smoke tests for frontend, proxy, API, MongoDB, and Redis
- separate migrations instead of hidden startup migrations
- rollback and release procedures in `docs/production-deployment.md`

## A strong two-minute explanation

“Imminiq is a full-stack learning platform I built around a simple problem: learners spend too much
time deciding what to study, while purely AI-generated roadmaps can be incomplete. A learner gives
Imminiq a goal, and the platform generates a structured tracker with topics, subtopics, and lessons.
The learner then studies through contextual AI support, mock tests, code execution, revision,
progress analytics, and social learning.

The differentiator is that AI only creates the starting point. Trackers can be published, reviewed,
improved, and verified by the community, so their quality can grow over time. The platform also has
a synchronized admin console for moderation, users, subscriptions, support, broadcasts, audit
logs, queues, and feature availability.

Technically, it is a TypeScript monorepo with React and Vite on the frontend and Express on the
backend. The backend uses modular Clean Architecture, MongoDB, Redis, BullMQ, Socket.IO, and WebRTC.
I added automated architecture tests so domain and application logic cannot depend on frameworks,
and every use case remains focused. Security includes rotating sessions, reuse detection, CSRF,
origin validation, 2FA, rate limiting, step-up admin authorization, encrypted secrets, CSP, and
production environment validation.

My goal was not only to build features, but to build a maintainable learning product where AI speed,
community knowledge, security, and operational reliability work together.”

## Common interview questions

### Why use Clean Architecture?

It keeps learning and security rules independent from Express, MongoDB, Redis, or any AI provider.
Adapters can change without rewriting the use cases, and boundaries are testable.

### Why MongoDB?

Trackers, nested roadmap content, conversations, attempts, and evolving learning documents fit a
document model well. References and indexes are still used where ownership, uniqueness, reporting,
or high-volume querying require them.

### Why Redis?

Redis supports short-lived sessions and verification flows, rate limiting, cached security state,
presence-related data, and BullMQ.

### Why BullMQ?

AI generation is slow and failure-prone compared with an ordinary request. A durable queue supports
progress, retry, backoff, concurrency control, and operational visibility.

### How do you prevent AI mistakes?

Outputs are schema-validated, provider fallbacks are used, public content supports reporting and
review, contributions require verification, and AI is treated as a draft generator rather than the
source of truth.

### How do you protect private data from administrators?

Admin capabilities are explicitly scoped to operational and moderation needs. Private chats, calls,
saved items, and device-local information are excluded. Consequential actions require reasons,
auditing, and step-up authorization.

### What would you improve next?

The next production investments would be real-user load testing, regional WebRTC quality metrics,
expanded end-to-end browser coverage, deeper observability dashboards, and continued measurement of
learning outcomes.
