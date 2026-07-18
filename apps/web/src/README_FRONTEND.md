# Imminiq Frontend Architecture, Design System, and AI Module Guide

> **Status:** Authoritative frontend guide  
> **Audited source:** Latest refactored Imminiq `src` tree  
> **Last reviewed:** 2026-07-03  
> **Audience:** Imminiq developers, reviewers, and AI coding assistants

This document explains the complete Imminiq frontend architecture and defines the rules for creating or modifying modules without breaking consistency.

Treat this file as the **source of truth** for frontend work. Before an AI or developer changes the frontend, they should read this document and inspect the relevant existing module.

No document can literally guarantee perfect results from every AI model. However, following these rules, templates, and validation checks gives the highest practical consistency and prevents the common mistakes that previously caused duplicated layouts, conflicting state, inconsistent cards, and broken module behavior.

---

## Table of contents

1. [Project goals](#1-project-goals)
2. [Technology stack](#2-technology-stack)
3. [Architecture overview](#3-architecture-overview)
4. [Complete source layout](#4-complete-source-layout)
5. [Application boot process](#5-application-boot-process)
6. [Routing architecture](#6-routing-architecture)
7. [Layout and page composition](#7-layout-and-page-composition)
8. [State-management rules](#8-state-management-rules)
9. [API and authentication architecture](#9-api-and-authentication-architecture)
10. [TanStack Query conventions](#10-tanstack-query-conventions)
11. [Zustand conventions](#11-zustand-conventions)
12. [URL state conventions](#12-url-state-conventions)
13. [Forms and validation](#13-forms-and-validation)
14. [Shared component system](#14-shared-component-system)
15. [Design system](#15-design-system)
16. [Responsive design rules](#16-responsive-design-rules)
17. [Accessibility rules](#17-accessibility-rules)
18. [Loading, empty, error, and feedback states](#18-loading-empty-error-and-feedback-states)
19. [Modal and overlay rules](#19-modal-and-overlay-rules)
20. [Performance rules](#20-performance-rules)
21. [Module boundaries and imports](#21-module-boundaries-and-imports)
22. [Current module responsibilities](#22-current-module-responsibilities)
23. [How to create a new module](#23-how-to-create-a-new-module)
24. [Complete example module](#24-complete-example-module)
25. [How to add a route](#25-how-to-add-a-route)
26. [How to add command-palette navigation](#26-how-to-add-command-palette-navigation)
27. [How to add a new settings page](#27-how-to-add-a-new-settings-page)
28. [How to add a focused workspace](#28-how-to-add-a-focused-workspace)
29. [Testing and validation](#29-testing-and-validation)
30. [Code-review checklist](#30-code-review-checklist)
31. [Anti-patterns](#31-anti-patterns)
32. [AI instruction prompt](#32-ai-instruction-prompt)
33. [Quick reference](#33-quick-reference)

---

# 1. Project goals

The frontend should feel like one coherent product rather than multiple unrelated pages.

The architecture is designed around these goals:

- Preserve feature ownership inside modules.
- Keep server data in TanStack Query.
- Keep global client state small and intentional.
- Keep shareable navigation state in the URL.
- Reuse root components for layouts, cards, forms, feedback, navigation, and overlays.
- Avoid cross-module coupling.
- Keep routes lazy-loaded.
- Support keyboard navigation, reduced motion, screen readers, and responsive devices.
- Preserve the warm cream, rust, and espresso visual identity.
- Make new modules look and behave like existing modules immediately.

---

# 2. Technology stack

The frontend uses:

- **React** with functional components and hooks
- **TypeScript** with strict typing
- **Vite** for development and production bundling
- **React Router** for routing
- **TanStack React Query** for server state
- **Zustand** for carefully scoped client state
- **Axios** through the shared API client
- **Tailwind CSS 4** plus semantic CSS variables
- **Socket.IO Client** where realtime behavior is required

The application does not need Redux for its current architecture.

## State stack

| Type of state | Correct owner |
|---|---|
| API/server data | TanStack Query |
| Search, filters, pagination, tabs that should survive refresh | URL search parameters |
| Global authenticated client state | Root Zustand stores |
| Multi-step feature drafts | Module Zustand store |
| Small temporary UI state | Local React state |
| Durable preferences | Safe local storage through a store/helper |
| Current-session workflow state | Safe session storage through a module store/helper |

---

# 3. Architecture overview

The frontend is feature-based.

```text
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/        # Shared application-wide UI and behavior
├── hooks/             # Shared application-wide hooks
├── lib/               # API client, query client, storage, navigation, utilities
├── modules/           # Feature modules
├── pages/             # Root system pages
├── routes/            # Route groups and guards
└── store/             # Root global client stores
```

## Architectural direction

```text
Route
  ↓
Page component
  ↓
Module hooks + shared layout/components
  ↓
TanStack Query / module client state
  ↓
Shared Axios client
  ↓
Backend API
```

A page should coordinate data and presentation. It should not contain an entire design system, duplicate the authenticated shell, or directly manage authentication tokens.

---

# 4. Complete source layout

## Root application files

```text
src/
├── App.tsx                 # Global runtime composition
├── main.tsx                # React, router, and query providers
└── index.css               # Tokens, typography, surfaces, motion, global CSS
```

## Shared components

```text
components/
├── data-display/
│   ├── StatCard.tsx
│   ├── StatGrid.tsx
│   └── UserAvatar.tsx
├── feedback/
│   ├── EmptyState.tsx
│   ├── EmptyStateIllustration.tsx
│   ├── ErrorState.tsx
│   └── SkeletonBlock.tsx
├── filters/
│   ├── FilterBar.tsx
│   └── SearchInput.tsx
├── forms/
│   ├── FormField.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   └── Textarea.tsx
├── layout/
│   ├── AppNoiseOverlay.tsx
│   ├── AppShell.tsx
│   ├── AuthenticatedAppLayout.tsx
│   ├── Footer.tsx
│   ├── PageContainer.tsx
│   ├── PageHeader.tsx
│   ├── SectionCard.tsx
│   ├── SectionHeader.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── navigation/
│   ├── GlobalNavigationController.tsx
│   ├── NavPillTabs.tsx
│   ├── Pagination.tsx
│   └── PillTabs.tsx
├── overlays/
│   ├── CommandPalette.tsx
│   ├── ConfirmDialog.tsx
│   └── Modal.tsx
├── system/
│   ├── AppErrorBoundary.tsx
│   ├── NetworkRedirector.tsx
│   ├── OnlineStatus.tsx
│   ├── RouteExperience.tsx
│   ├── SystemPageChrome.tsx
│   ├── ToastProvider.tsx
│   └── WidgetErrorBoundary.tsx
└── ui/
    ├── Button.tsx
    ├── IconButton.tsx
    ├── ImminiqLogo.tsx
    ├── ImminiqWordmark.tsx
    └── PageLoadingScreen.tsx
```

## Shared hooks and libraries

```text
hooks/
├── activity/
├── auth/
├── friends/
├── moderation/
├── progress/
├── useDebouncedValue.ts
└── useUnsavedChangesGuard.ts

lib/
├── axios.ts
├── cn.ts
├── navigation-commands.ts
├── queryClient.ts
├── route-prefetch.ts
├── socket.ts
├── toast.ts
└── storage/
    ├── safe-storage.ts
    └── storage-keys.ts
```

## Feature modules

```text
modules/
├── activity/
├── auth/
├── community/
├── dashboard/
├── friends/
├── landing/
├── leaderboard/
├── legal/
├── mock-tests/
├── settings/
├── tracker-creation/
├── trackers/
└── users/
```

---

# 5. Application boot process

## `main.tsx`

`main.tsx` mounts the application with:

1. `React.StrictMode`
2. `BrowserRouter`
3. `QueryClientProvider`
4. `App`
5. React Query Devtools only during development

Do not create a second router or query client inside a module.

## `App.tsx`

`App.tsx` owns global runtime behavior:

- Theme initialization
- Global error boundary
- Skip-to-content link
- Offline/online behavior
- Route transitions, document titles, and scroll restoration
- Authentication session bridge
- Global command palette and navigation shortcuts
- Route rendering
- Root toast provider

A feature module must not recreate these systems.

---

# 6. Routing architecture

Routes are separated by behavior.

```text
routes/
├── AppRoutes.tsx
├── public.routes.tsx
├── tracker-creation.routes.tsx
├── focused.routes.tsx
├── authenticated.routes.tsx
├── admin.routes.tsx
├── route-paths.ts
├── ProtectedRoute.tsx
├── AdminRoute.tsx
└── AuthSessionBridge.tsx
```

## Public routes

Public routes do not require authentication.

Examples:

- Landing
- Login
- Registration
- Password recovery
- Account verification
- Legal pages
- Public profile
- Blocked and offline pages

## Authenticated routes

These routes are wrapped by:

```tsx
<ProtectedRoute>
  <AuthenticatedAppLayout>
    <Page />
  </AuthenticatedAppLayout>
</ProtectedRoute>
```

The authenticated layout supplies:

- Sidebar
- Top bar
- Footer
- Bottom navigation
- Global streak
- Authenticated viewer information
- Shared route error boundary

A normal authenticated page **must not render its own full sidebar/top bar/footer**.

## Focused routes

Focused routes are protected but intentionally avoid standard application chrome.

Current focused routes:

- Mock-test attempt
- Tracker lesson
- Quick revision

They still receive global authenticated behavior such as keyboard navigation because `GlobalNavigationController` is mounted above both normal and focused routes.

## Tracker-creation routes

Tracker creation is protected, owned by the tracker module, and has its own workflow presentation and session-persisted draft state.

## Admin routes

Admin routes are placed behind `AdminRoute`.

## Route rules

- Lazy-load every major page.
- Put the route in the correct route-group file.
- Add reusable route constants/builders to `route-paths.ts` when useful.
- Do not declare routes inside feature components.
- Do not use raw `window.location` for normal internal navigation.
- Use `navigate()` or `<Link>`.

---

# 7. Layout and page composition

## Normal authenticated page

The preferred structure is:

```tsx
export default function ExamplePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Example"
        title="Example page"
        description="A concise explanation of this page."
        actions={<Button>Create</Button>}
      />

      <StatGrid>
        <StatCard label="Total" value={10} helper="Created items" />
      </StatGrid>

      <SectionCard>
        <SectionHeader title="Recent items" />
        {/* Feature content */}
      </SectionCard>
    </PageContainer>
  )
}
```

## `PageContainer`

`PageContainer` is the default page-width authority.

It provides:

- `--content-max`, currently `1180px`
- Consistent desktop and mobile gutters
- Top spacing
- Section gaps
- Bottom navigation safe space
- Optional `comfortable` or `compact` density

Do not create custom page widths unless the page is a focused specialist workspace.

## `PageHeader`

Use for ordinary page headings.

It supports:

- Eyebrow
- Page title
- Description
- Actions

Do not manually reproduce the same border, spacing, and responsive action behavior.

## `SectionCard`

Variants:

- `flat`: ordinary list/content card
- `elevated`: important section
- `spotlight`: one high-priority feature or achievement

Padding:

- `none`
- `sm`
- `md`
- `lg`

## Thin module shells

Existing wrappers such as `TrackerShell`, `FriendsAppShell`, `ActivityAppShell`, and `LeaderboardAppShell` are compatibility wrappers around `AppShellBoundary`.

New modules should prefer direct shared layouts and must not duplicate shell implementation.

---

# 8. State-management rules

Use this decision order.

## Question 1: Is the data from the backend?

Use TanStack Query.

Examples:

- Tracker list
- Dashboard summary
- User profile
- Friends
- Community data
- Mock tests
- Settings
- Leaderboard
- Activity
- Streak

Do not copy query results into Zustand.

## Question 2: Should the state survive refresh or be shareable in a URL?

Use URL search parameters.

Examples:

- Search text
- Sort
- Filters
- Pagination
- Active result tab
- Leaderboard scope
- Activity period

## Question 3: Is it global application client state?

Use a root Zustand store.

Current root stores:

- `useAuthStore`
- `useAppShellStore`
- `useThemeStore`

## Question 4: Is it a multi-step feature draft shared across module screens?

Use a module Zustand store.

Current examples:

- Tracker-creation draft
- Mock-test generation draft
- Profile overlay coordination

## Question 5: Is it only needed by one component or one small subtree?

Use local React state.

Examples:

- Password visibility
- Open dropdown
- Temporary form input
- One confirmation dialog
- Hover state
- Loading state that is not already supplied by a mutation

---

# 9. API and authentication architecture

## Shared client

All API calls must use:

```ts
import api from '../../../lib/axios'
```

Adjust the relative path as required.

Do not create module-specific Axios instances.

## API client behavior

The shared client provides:

- Base URL from `VITE_API_URL`
- `withCredentials: true`
- Access-token authorization header
- CSRF header for unsafe methods
- Refresh-token request through HTTP-only cookie
- One retry of the original request after refresh
- Restricted account handling
- Auth-store cleanup when authentication becomes invalid

## Security rules

- Never put refresh tokens in local storage.
- Never manually attach access tokens inside individual hooks.
- Never bypass the CSRF flow for POST, PUT, PATCH, or DELETE.
- Never handle blocked/banned redirects separately in every module.
- Never expose authentication secrets in query parameters.

## Response types

Define precise response and payload types.

```ts
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
```

Some existing modules have slightly different backend response shapes, such as optional `data` or `meta`. Preserve the actual contract. Do not force a generic type that lies about the response.

---

# 10. TanStack Query conventions

## Query-key factory

Every substantial module should own a query-key factory.

```ts
export const exampleKeys = {
  all: ['examples'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  list: (query: ExampleListQuery) => [...exampleKeys.lists(), query] as const,
  details: () => [...exampleKeys.all, 'detail'] as const,
  detail: (id: string) => [...exampleKeys.details(), id] as const,
}
```

Benefits:

- Predictable cache structure
- Safe invalidation
- Easier debugging
- No inconsistent string keys

## Query hook

```ts
export const useExamples = (query: ExampleListQuery) =>
  useQuery({
    queryKey: exampleKeys.list(query),
    queryFn: async () => {
      const response = await api.get<ApiResponse<ExampleListResponse>>(
        '/examples',
        { params: query },
      )

      return response.data.data
    },
    placeholderData: keepPreviousData,
  })
```

## Detail query

Use `enabled` when an identifier may be missing.

```ts
export const useExample = (id?: string) =>
  useQuery({
    queryKey: exampleKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Example>>(`/examples/${id}`)
      return response.data.data
    },
  })
```

## Mutation hook

```ts
export const useCreateExample = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateExamplePayload) => {
      const response = await api.post<ApiResponse<Example>>(
        '/examples',
        payload,
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exampleKeys.all })
    },
  })
}
```

## Mutation rules

- Disable submit buttons while pending.
- Prefer `mutateAsync` when the page must await completion.
- Invalidate the smallest correct query family.
- Update cache directly only when behavior is clear and safe.
- Roll back optimistic updates on failure.
- Show feedback through the root toast system.
- Do not store mutation loading state manually when the mutation already exposes it.

## Global defaults

The root query client currently provides:

- Up to two retries for suitable query errors
- No retries for normal client errors except timeout/rate-limit cases
- Three-minute default stale time
- Thirty-minute garbage collection
- No refetch on window focus by default
- Refetch on reconnect
- No mutation retries

Override defaults only for a documented reason.

---

# 11. Zustand conventions

## Root store rules

Root stores are only for application-wide client state.

### `useAuthStore`

Owns:

- Current user snapshot
- In-memory access token
- Authentication status
- Auth bootstrap readiness

Only the user/authenticated marker is persisted. The access token is not persisted.

### `useAppShellStore`

Owns:

- Mobile sidebar open state
- Sidebar collapsed state
- Command palette open state

Only collapsed sidebar preference is persisted.

### `useThemeStore`

Owns:

- Saved theme mode
- Currently applied theme
- Temporary preview mode
- System theme synchronization

## Module store rules

A module store must:

- Be inside that module
- Have a precise name
- Store client state, not API responses
- Persist only when the workflow needs it
- Define a clear reset action

Good example:

```ts
interface GenerateDraftStore {
  draft: GenerateDraft
  updateDraft: (patch: Partial<GenerateDraft>) => void
  resetDraft: () => void
}
```

Bad example:

```ts
interface BadStore {
  examplesFromApi: Example[]
  loading: boolean
  error: string | null
}
```

That belongs in React Query.

---

# 12. URL state conventions

Use `useSearchParams` for shareable state.

```ts
const [searchParams, setSearchParams] = useSearchParams()

const search = searchParams.get('q') ?? ''
const page = Math.max(1, Number(searchParams.get('page') ?? 1))
```

When filters change, reset pagination.

```ts
const setSearch = (value: string) => {
  const next = new URLSearchParams(searchParams)

  if (value) next.set('q', value)
  else next.delete('q')

  next.delete('page')
  setSearchParams(next, { replace: true })
}
```

## Use URL state for

- Search
- Sort
- Filters
- Pagination
- Shareable tabs
- Scope/section selections

## Do not use URL state for

- Password visibility
- Modal open state
- Drag position
- Unsaved form values
- Temporary toast state
- Private tokens

---

# 13. Forms and validation

Use shared form components:

- `FormField`
- `Input`
- `Select`
- `Textarea`
- `Button`

A consistent field should include:

- Label
- Required indicator when needed
- Description when useful
- Error message
- Correct `id` and `htmlFor`
- Disabled/pending state

## Form behavior rules

- Validate before sending.
- Map server errors to understandable UI feedback.
- Disable duplicate submissions.
- Show pending text.
- Protect long unsaved forms with `useUnsavedChangesGuard`.
- Reset only after successful completion.
- Do not erase user input on failed requests.
- Avoid synchronous `setState` effects when derived state can be computed directly.

## Unsaved changes

Use the shared hook when leaving could discard meaningful work.

```ts
const guard = useUnsavedChangesGuard({
  when: isDirty,
  onDiscard: resetForm,
})
```

Render a confirmation dialog using the state returned by the hook.

---

# 14. Shared component system

Before creating a component inside a module, check whether a root component already solves the same visual or behavioral problem.

## Buttons

### `Button`

Variants:

- `primary`
- `secondary`
- `ghost`
- `danger`
- `outline-danger`

Sizes:

- `sm`
- `md`
- `lg`

Features:

- Loading spinner
- Loading text
- Left/right icons
- Full width
- Automatic disabled state while loading

```tsx
<Button
  loading={createMutation.isPending}
  loadingText="Creating..."
  leftIcon={<PlusIcon />}
  onClick={handleCreate}
>
  Create tracker
</Button>
```

### `IconButton`

Every icon-only button requires a meaningful `label`.

```tsx
<IconButton label="Close dialog">
  <CloseIcon />
</IconButton>
```

## Data display

### `StatCard`

Use for numeric summaries.

Props include:

- `label`
- `value`
- `helper`
- `trend`
- `tone`
- `variant`
- `action`

### `StatGrid`

Use instead of manually repeating responsive stat columns.

```tsx
<StatGrid columns={4}>
  <StatCard label="Total" value={24} />
  <StatCard label="Active" value={8} tone="blue" />
</StatGrid>
```

### `UserAvatar`

Provides:

- Standard sizes
- Lazy loading
- Async image decoding
- Fallback initials
- Image failure handling

Do not recreate avatar fallback logic in a module.

## Feedback

### `EmptyState`

Use for valid empty content.

### `ErrorState`

Use for recoverable content-loading failures.

### `SkeletonBlock`

Build skeletons that resemble the final layout.

## Filters and navigation

Use:

- `FilterBar`
- `SearchInput`
- `PillTabs`
- `NavPillTabs`
- `Pagination`

## Overlays

Use:

- `Modal`
- `ConfirmDialog`
- `CommandPalette`

Do not manually implement body locking, focus trapping, portals, Escape handling, or focus restoration.

---

# 15. Design system

The visual direction is **warm academic minimalism**.

## Brand identity

- Warm cream canvas
- Rust primary accent
- Deep espresso-dark theme
- Muted semantic green, amber, blue, and red
- Mostly flat cards
- Limited spotlight surfaces
- Fast, subtle motion

## Logo rule

Use the shared branding components:

```tsx
<ImminiqLogo />
<ImminiqWordmark />
```

Wordmark rule:

- `Immin` uses the normal foreground color
- `iq` uses rust/brand color

Do not hardcode the wordmark separately.

## Typography

### Fonts

```text
UI:        Geist Sans fallback stack
Metrics:   Geist Mono fallback stack
Editorial: Playfair Display, special moments only
```

### Typography utilities

- `type-display-xl`
- `type-heading-xl`
- `type-heading-lg`
- `type-heading-md`
- `type-body-md`
- `type-body-sm`
- `type-label-sm`
- `type-metric-xl`

Use editorial typography only for special landing or achievement moments.

## Semantic tokens

Use CSS variables instead of hardcoded repeated colors.

### Brand

- `--brand-50`
- `--brand-100`
- `--brand-200`
- `--brand-500`
- `--brand-600`
- `--brand-700`
- `--brand-contrast`

### Surfaces

- `--surface-canvas`
- `--surface-card`
- `--surface-elevated`
- `--surface-muted`
- `--surface-sunken`
- `--surface-overlay`

### Text

- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--text-inverse`

### Borders

- `--border-subtle`
- `--border-strong`
- `--focus-ring`

### Semantic colors

- `--success`
- `--warning`
- `--danger`
- `--info`

## Radius system

Use only:

- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 16px
- `--radius-xl`: 20px
- `--radius-pill`: fully rounded

Avoid introducing arbitrary values such as 11px, 14px, 18px, or 22px without a strong reason.

## Elevation system

- `--shadow-1`: ordinary elevated cards
- `--shadow-2`: menus/sticky elements
- `--shadow-3`: modals
- `--shadow-focus`: focused controls

## Surface utilities

- `surface-flat`
- `surface-elevated`
- `surface-spotlight`

Use spotlight surfaces sparingly.

## Motion

Motion variables:

- `--motion-fast`
- `--motion-normal`
- `--motion-slow`
- `--ease-standard`

The application respects `prefers-reduced-motion`.

Do not add long or distracting animation.

---

# 16. Responsive design rules

Test at minimum:

- 360px
- 390px
- 640px
- 768px
- 900px
- 1024px
- 1280px
- 1440px

## Page gutters

Use `PageContainer`; do not invent page-level margin values.

## Mobile behavior

- Stack primary actions when needed.
- Keep touch targets at least about 40–44px.
- Avoid horizontal page scrolling.
- Allow tables or specialist content to scroll inside their own container.
- Keep text readable without zooming.
- Keep modal headers/actions visible; scroll only the content body.
- Add safe-area padding for fixed bottom controls.

## Grids

Prefer predictable responsive patterns:

```tsx
<StatGrid columns={4}>...</StatGrid>
```

For feature grids, use a clear progression such as:

```text
1 column mobile
2 columns tablet
3 columns desktop
```

Do not force four tiny cards on narrow screens.

---

# 17. Accessibility rules

Every new feature must support keyboard and screen-reader use.

## Required practices

- Use semantic buttons for actions.
- Use links for navigation.
- Add `aria-label` to icon-only buttons.
- Keep heading order logical.
- Provide visible `:focus-visible` behavior.
- Associate labels and inputs.
- Announce loading and route changes where useful.
- Use `role="status"` for noninterruptive loading state.
- Use `role="alertdialog"` for destructive confirmations.
- Trap focus inside modals.
- Restore focus after modals close.
- Respect reduced motion.
- Add meaningful image alt text; use empty/decorative treatment when appropriate.

## Global keyboard navigation

Authenticated pages support:

- `Ctrl + K` or `Command + K`: command palette
- `G`, then a destination letter: quick navigation

Global shortcuts must remain mounted above both normal and focused routes.

Do not place a global listener inside `TopBar`, because focused routes hide the top bar.

Shortcuts must be disabled while typing in:

- Inputs
- Textareas
- Selects
- Content-editable regions
- Code editors/textbox roles

---

# 18. Loading, empty, error, and feedback states

Every server-backed page must deliberately handle:

1. Initial loading
2. Background refetching
3. Empty success state
4. Recoverable error state
5. Mutation pending state
6. Mutation error state
7. Mutation success feedback

## Initial loading

Use layout-matching skeletons.

Do not replace the entire page with a tiny spinner when the expected layout is known.

## Background refetch

Keep existing data visible and reduce opacity or show a subtle updating label.

Use `keepPreviousData` for paginated lists where appropriate.

## Empty state

An empty result is not an error.

Explain:

- What is empty
- Why it may be empty
- What the user can do next

## Error state

Provide a retry action when useful.

## Toasts

Use the root toast API:

```ts
import { toast } from '../../../lib/toast'

const toastId = toast.loading('Publishing tracker...')

try {
  await mutation.mutateAsync(payload)
  toast.update(toastId, {
    title: 'Tracker published',
    tone: 'success',
  })
} catch {
  toast.update(toastId, {
    title: 'Unable to publish tracker',
    tone: 'error',
  })
}
```

Do not create a new module-specific toast system.

---

# 19. Modal and overlay rules

Use the shared `Modal`.

It already supplies:

- React portal
- Viewport positioning
- Backdrop
- Escape closing
- Backdrop closing
- Body scroll lock
- Scrollbar compensation
- Focus trapping
- Initial focus
- Focus restoration
- Accessible dialog attributes

## Modal sizing

The default modal width is `max-w-md`.

Override it through `contentClassName`.

When a stronger class must override the default Tailwind max-width, use the important utility:

```tsx
<Modal
  contentClassName="w-full !max-w-[1100px]"
>
  ...
</Modal>
```

## Large modal pattern

```tsx
<Modal
  open={open}
  onClose={onClose}
  contentClassName="flex max-h-[calc(100dvh-2rem)] w-full !max-w-[1100px] flex-col overflow-hidden p-0"
>
  <header className="shrink-0">...</header>
  <div className="min-h-0 flex-1 overflow-y-auto">...</div>
  <footer className="shrink-0">...</footer>
</Modal>
```

This prevents users from having to scroll the background page to access modal content.

## Confirmations

Use `ConfirmDialog` for:

- Delete
- Archive when destructive
- Remove friend
- Submit final test
- Abandon attempt
- Reset progress
- Account deletion

Do not interrupt ordinary navigation with unnecessary confirmations.

---

# 20. Performance rules

## Lazy routes

All major pages are lazy-loaded. Continue this pattern.

## Query caching

Use query keys and appropriate stale times rather than refetching everything on every render.

## Images

Use:

- Explicit sizing where possible
- `loading="lazy"` for noncritical images
- `decoding="async"`
- Fallback behavior
- Cropped/compressed uploads

Use `UserAvatar` for profile images.

## Long lists

Use the `render-lazy` utility for long card feeds when safe:

```tsx
<div className="render-lazy">...</div>
```

For very large datasets, use pagination or virtualization rather than rendering hundreds of complex cards.

## Heavy widgets

Wrap isolated heavy widgets with `WidgetErrorBoundary` so one compiler, AI tutor, or visualizer failure does not crash the page.

## Avoid unnecessary work

- Memoize only expensive derived data.
- Do not use `JSON.stringify` as an effect dependency.
- Do not copy server data into another state layer.
- Do not create a new object in a query key unless its values are stable and intentional.
- Do not mount hidden feature pages.

---

# 21. Module boundaries and imports

## Inside a module

Relative imports between files in the same module are allowed.

```ts
import { useExamples } from '../hooks/useExamples'
```

## Across modules

Use the target module’s public `index.ts`.

Correct:

```ts
import { useTrackers, type Tracker } from '../../trackers'
```

Incorrect:

```ts
import { useTrackers } from '../../trackers/hooks/useTrackerQueries'
```

Deep cross-module imports make unrelated modules depend on internal folder structure.

## Shared root imports

Import application-wide behavior from:

- `src/components`
- `src/hooks`
- `src/lib`
- `src/store`

## Public module API

Expose only what other modules genuinely need.

```ts
export { useExamples } from './hooks/useExampleQueries'
export type { Example, ExampleListQuery } from './types/example.types'
```

Do not export every internal component automatically.

---

# 22. Current module responsibilities

## `activity`

Owns:

- Activity page
- Activity feed
- Heatmap
- Activity filters
- Activity statistics

## `auth`

Owns:

- Login
- Registration
- Password recovery
- Two-factor login challenge
- Account/email verification
- Authentication-specific validation and formatting

Authentication state itself is owned by the root `useAuthStore`.

## `community`

Owns:

- Community tracker browse
- Public tracker detail
- Clone/review/like behavior
- Verification queue
- Verification voting
- Verify-and-earn experience

## `dashboard`

Owns:

- Dashboard composition
- Current roadmap summary
- Activity overview
- AI insight
- Friends hub summary
- Recommended actions

It must not become the data provider for top bars in other modules.

## `friends`

Owns:

- Friend list
- Friend requests
- Friend search
- Accept/decline/cancel/remove behavior

## `landing`

Owns the public marketing page and its animations.

## `leaderboard`

Owns:

- Leaderboard data
- Podium/table
- Scope and section controls
- Rewards page

## `legal`

Owns privacy and terms presentation.

## `mock-tests`

Owns:

- Test listing
- Generation flow
- Tracker/topic selection
- Test details
- Attempt workspace
- Result and analysis
- Generation draft state

## `settings`

Owns:

- Security
- Notifications
- Preferences
- Privacy
- Two-factor configuration
- Unsaved settings behavior

Server settings remain in React Query, not a global settings store.

## `tracker-creation`

Owns:

- Personalized tracker-creation intake
- Roadmap generation status
- Evaluation status/result
- Session-persisted creation draft state

## `trackers`

Owns:

- Tracker list
- Published trackers
- Tracker management
- Roadmap
- Lesson workspace
- Quick revision
- Lesson chat/compiler/visualizer/practice
- Tracker query-key family and mutations

## `users`

Owns:

- Own/public profile
- Profile statistics and badges
- Profile editor
- Avatar crop
- Banner editor
- Published trackers section
- Profile-specific UI state

---

# 23. How to create a new module

Assume the module is called `achievements`.

## Recommended structure

```text
modules/achievements/
├── components/
│   ├── AchievementCard.tsx
│   ├── AchievementFilters.tsx
│   └── AchievementListSkeleton.tsx
├── constants/
│   └── achievement.constants.ts
├── hooks/
│   ├── achievement.keys.ts
│   ├── useAchievementQueries.ts
│   ├── useAchievementMutations.ts
│   └── useAchievementSearchState.ts
├── pages/
│   ├── AchievementsPage.tsx
│   └── AchievementDetailsPage.tsx
├── store/
│   └── useAchievementDraftStore.ts    # Only when genuinely required
├── types/
│   └── achievement.types.ts
├── utils/
│   ├── achievement-formatters.ts
│   └── achievement-validation.ts
└── index.ts
```

Not every module needs every folder. Create folders only when they have a real responsibility.

## Creation sequence

1. Define API and UI types.
2. Define query keys.
3. Add query hooks.
4. Add mutation hooks.
5. Add URL search-state hook when needed.
6. Add focused module components.
7. Build the page using shared root layout/components.
8. Add lazy route.
9. Add command-palette entry only when the page is a primary destination.
10. Export required public hooks/types through `index.ts`.
11. Run typecheck, lint, tests, and build.

---

# 24. Complete example module

## Types

```ts
// modules/achievements/types/achievement.types.ts

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Achievement {
  _id: string
  title: string
  description: string
  category: string
  earnedAt?: string | null
}

export interface AchievementListQuery {
  search?: string
  category?: string
  page?: number
  limit?: number
}

export interface AchievementListResponse {
  achievements: Achievement[]
  total: number
  page: number
  totalPages: number
}

export interface ClaimAchievementPayload {
  achievementId: string
}
```

## Query keys

```ts
// modules/achievements/hooks/achievement.keys.ts

import type { AchievementListQuery } from '../types/achievement.types'

export const achievementKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementKeys.all, 'list'] as const,
  list: (query: AchievementListQuery) =>
    [...achievementKeys.lists(), query] as const,
  details: () => [...achievementKeys.all, 'detail'] as const,
  detail: (achievementId: string) =>
    [...achievementKeys.details(), achievementId] as const,
}
```

## Queries

```ts
// modules/achievements/hooks/useAchievementQueries.ts

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import api from '../../../lib/axios'
import type {
  Achievement,
  AchievementListQuery,
  AchievementListResponse,
  ApiResponse,
} from '../types/achievement.types'
import { achievementKeys } from './achievement.keys'

export const useAchievements = (query: AchievementListQuery) =>
  useQuery({
    queryKey: achievementKeys.list(query),
    queryFn: async () => {
      const response = await api.get<ApiResponse<AchievementListResponse>>(
        '/achievements',
        { params: query },
      )

      return response.data.data
    },
    placeholderData: keepPreviousData,
  })

export const useAchievement = (achievementId?: string) =>
  useQuery({
    queryKey: achievementKeys.detail(achievementId ?? ''),
    enabled: Boolean(achievementId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Achievement>>(
        `/achievements/${achievementId}`,
      )

      return response.data.data
    },
  })
```

## Mutation

```ts
// modules/achievements/hooks/useAchievementMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../../../lib/axios'
import { toast } from '../../../lib/toast'
import type {
  Achievement,
  ApiResponse,
  ClaimAchievementPayload,
} from '../types/achievement.types'
import { achievementKeys } from './achievement.keys'

export const useClaimAchievement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ achievementId }: ClaimAchievementPayload) => {
      const response = await api.post<ApiResponse<Achievement>>(
        `/achievements/${achievementId}/claim`,
      )

      return response.data.data
    },
    onSuccess: (achievement) => {
      queryClient.setQueryData(
        achievementKeys.detail(achievement._id),
        achievement,
      )

      queryClient.invalidateQueries({
        queryKey: achievementKeys.lists(),
      })

      toast.success('Achievement claimed')
    },
    onError: () => {
      toast.error('Unable to claim achievement')
    },
  })
}
```

## URL search state

```ts
// modules/achievements/hooks/useAchievementSearchState.ts

import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useAchievementSearchState = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? 'all'
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))

  const update = useCallback(
    (patch: Record<string, string | number | null>) => {
      const next = new URLSearchParams(searchParams)

      Object.entries(patch).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })

      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  return {
    search,
    category,
    page,
    setSearch: (value: string) => update({ q: value, page: null }),
    setCategory: (value: string) => update({ category: value, page: null }),
    setPage: (value: number) => update({ page: value }),
  }
}
```

## Card

```tsx
// modules/achievements/components/AchievementCard.tsx

import Button from '../../../components/ui/Button'
import SectionCard from '../../../components/layout/SectionCard'
import type { Achievement } from '../types/achievement.types'

interface AchievementCardProps {
  achievement: Achievement
  claiming: boolean
  onClaim: (achievementId: string) => void
}

export default function AchievementCard({
  achievement,
  claiming,
  onClaim,
}: AchievementCardProps) {
  return (
    <SectionCard variant="flat" className="flex h-full flex-col">
      <div className="type-label-sm text-[var(--brand-500)]">
        {achievement.category}
      </div>

      <h2 className="type-heading-md mt-2 text-[var(--text-primary)]">
        {achievement.title}
      </h2>

      <p className="type-body-sm mt-2 flex-1 text-[var(--text-secondary)]">
        {achievement.description}
      </p>

      {!achievement.earnedAt && (
        <Button
          className="mt-4"
          loading={claiming}
          loadingText="Claiming..."
          onClick={() => onClaim(achievement._id)}
        >
          Claim
        </Button>
      )}
    </SectionCard>
  )
}
```

## Page

```tsx
// modules/achievements/pages/AchievementsPage.tsx

import { useMemo } from 'react'

import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import SkeletonBlock from '../../../components/feedback/SkeletonBlock'
import PageContainer from '../../../components/layout/PageContainer'
import PageHeader from '../../../components/layout/PageHeader'
import Pagination from '../../../components/navigation/Pagination'
import SearchInput from '../../../components/filters/SearchInput'
import AchievementCard from '../components/AchievementCard'
import { useClaimAchievement } from '../hooks/useAchievementMutations'
import { useAchievements } from '../hooks/useAchievementQueries'
import { useAchievementSearchState } from '../hooks/useAchievementSearchState'

export default function AchievementsPage() {
  const state = useAchievementSearchState()
  const query = useMemo(
    () => ({
      search: state.search,
      category: state.category,
      page: state.page,
      limit: 12,
    }),
    [state.category, state.page, state.search],
  )

  const achievementsQuery = useAchievements(query)
  const claimMutation = useClaimAchievement()

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Progress"
        title="Achievements"
        description="Review milestones earned throughout your learning journey."
      />

      <SearchInput
        value={state.search}
        onChange={(event) => state.setSearch(event.target.value)}
        onClear={() => state.setSearch('')}
        placeholder="Search achievements"
      />

      {achievementsQuery.isLoading && !achievementsQuery.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-52 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : achievementsQuery.isError || !achievementsQuery.data ? (
        <ErrorState onRetry={() => void achievementsQuery.refetch()} />
      ) : achievementsQuery.data.achievements.length === 0 ? (
        <EmptyState
          title="No achievements found"
          description="Try changing your search or continue learning to unlock new milestones."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {achievementsQuery.data.achievements.map((achievement) => (
              <AchievementCard
                key={achievement._id}
                achievement={achievement}
                claiming={
                  claimMutation.isPending &&
                  claimMutation.variables?.achievementId === achievement._id
                }
                onClaim={(achievementId) =>
                  claimMutation.mutate({ achievementId })
                }
              />
            ))}
          </div>

          <Pagination
            page={achievementsQuery.data.page}
            totalPages={achievementsQuery.data.totalPages}
            onPageChange={state.setPage}
            disabled={achievementsQuery.isFetching}
          />
        </>
      )}
    </PageContainer>
  )
}
```

> Always inspect shared component signatures before using them because shared APIs may evolve after this guide is updated.

## Public API

```ts
// modules/achievements/index.ts

export {
  useAchievement,
  useAchievements,
} from './hooks/useAchievementQueries'

export type {
  Achievement,
  AchievementListQuery,
} from './types/achievement.types'
```

---

# 25. How to add a route

## Normal authenticated route

```tsx
// routes/authenticated.routes.tsx

const AchievementsPage = lazy(
  () => import('../modules/achievements/pages/AchievementsPage'),
)

export const authenticatedRoutes: RouteObject[] = [
  // existing routes
  { path: '/achievements', element: <AchievementsPage /> },
]
```

The page automatically receives the authenticated app shell.

## Focused route

Use `focused.routes.tsx` only when the experience intentionally hides the normal sidebar/top bar/footer.

## Public route

Use `public.routes.tsx` only when authentication is not required.

## Dynamic paths

Create builders rather than repeating string interpolation everywhere.

```ts
export const achievementRoutes = {
  root: '/achievements',
  detail: (achievementId: string) => `/achievements/${achievementId}`,
}
```

---

# 26. How to add command-palette navigation

Primary destinations are defined in:

```text
src/lib/navigation-commands.ts
```

Add an entry:

```ts
{
  id: 'achievements',
  label: 'Achievements',
  description: 'View earned learning milestones',
  path: '/achievements',
  keywords: ['milestones', 'badges', 'awards', 'progress'],
  shortcut: ['g', 'h'],
}
```

Rules:

- Shortcut must not conflict with another command.
- Use two sequential keys, not a simultaneous chord.
- Keep descriptions short.
- Add meaningful search aliases.
- Verify the target route exists.
- Do not add every minor detail page to the command palette.

---

# 27. How to add a new settings page

A settings page should:

- Use `SettingsShell`
- Use the existing settings tab system
- Fetch data with React Query
- Keep editable form state locally
- Track a saved snapshot
- Derive `isDirty`
- Use unsaved-change protection
- Use theme preview only through `useThemeStore`
- Save server sections through mutations
- Show root toasts

Do not create a global settings-data store.

---

# 28. How to add a focused workspace

Use a focused route for tasks where normal navigation would distract or reduce usable space.

Examples:

- Timed test
- Lesson workspace
- Full-screen editor
- Exam simulator

Rules:

- Use full `100dvh` where appropriate.
- Keep only necessary controls.
- Keep global authenticated navigation behavior mounted.
- Add safe-area padding to fixed bottom controls.
- Keep the content region independently scrollable.
- Prevent accidental exit if meaningful unsaved work exists.
- Use an explicit exit action.
- Do not render the normal footer under a fixed workspace.

---

# 29. Testing and validation

Run these commands from the frontend application root after every meaningful change:

```bash
npm run typecheck
npm run lint
npm run build
```

Run available tests as well:

```bash
npm test
```

or the project’s specific test script.

## Manual validation

### Routing

- Direct URL load works.
- Refresh works.
- Browser back/forward works.
- Protected redirects work.
- Public pages remain public.
- Focused pages use correct chrome.

### State

- Filters survive refresh when URL-backed.
- API data is not duplicated into stores.
- Draft state resets at the correct time.
- Logout clears authenticated state.
- Theme preview reverts when unsaved.

### Responsive

- 360px mobile
- 390px mobile
- Tablet
- Laptop
- Wide desktop

### Accessibility

- Entire flow can be completed by keyboard.
- Focus is visible.
- Modal focus stays inside.
- Escape closes when allowed.
- Labels are announced.
- Icon-only buttons have names.
- Reduced-motion setting is respected.

### Network

- Initial loading state
- Slow refetch
- Empty response
- 401 refresh flow
- 403 restricted account flow
- 404
- 429
- 500
- Offline/reconnect

### Mutation safety

- Double clicking does not duplicate requests.
- Pending button is disabled.
- Failure preserves user input.
- Success updates/invalidate cache.
- Destructive actions require confirmation.

---

# 30. Code-review checklist

## Architecture

- [ ] Feature belongs to the correct module.
- [ ] No duplicated application shell.
- [ ] No unnecessary root store.
- [ ] No server data copied into Zustand.
- [ ] Shareable state is URL-backed.
- [ ] Cross-module import uses public `index.ts`.
- [ ] Shared component reused where appropriate.

## API

- [ ] Uses shared `api` client.
- [ ] Types match backend response.
- [ ] Query key factory used.
- [ ] Identifier-dependent queries use `enabled`.
- [ ] Mutation invalidates or updates correct cache.
- [ ] Pending state prevents duplicates.

## UI

- [ ] Uses `PageContainer` for a normal page.
- [ ] Uses semantic tokens.
- [ ] Uses standard radius/elevation.
- [ ] Uses shared button, form, avatar, modal, feedback components.
- [ ] Does not make every card a spotlight.
- [ ] Handles mobile and desktop.

## Accessibility

- [ ] Correct semantic element.
- [ ] Keyboard accessible.
- [ ] Visible focus.
- [ ] Proper label/ARIA text.
- [ ] Modal behavior correct.
- [ ] Reduced motion respected.

## Quality

- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] No unused exports/imports.
- [ ] No direct unsafe storage access.
- [ ] No placeholder links.
- [ ] No unrelated refactor mixed into the feature.

---

# 31. Anti-patterns

Never do these in new work.

## Duplicate shell

```tsx
// Wrong
<Sidebar />
<TopBar />
<Page />
<Footer />
```

The route layout already owns them.

## Server data in Zustand

```ts
// Wrong
const useExampleStore = create(() => ({
  examples: [],
  loading: false,
}))
```

Use React Query.

## Deep cross-module import

```ts
// Wrong
import { useTrackers } from '../../trackers/hooks/useTrackerQueries'
```

Use the module public API.

## Raw local storage

```ts
// Wrong
window.localStorage.setItem('theme', value)
```

Use typed storage keys and safe helpers/store.

## Module Axios instance

```ts
// Wrong
const client = axios.create({ baseURL: ... })
```

Use the root `api` client.

## Hardcoded repeated colors

```tsx
// Avoid for normal shared UI
className="bg-[#fdf8f5] text-[#1a1714] border-[#e0d0c5]"
```

Use semantic variables.

## Generic global modal string

```ts
// Wrong
activeModal: string | null
```

Use local state or a precise module UI store.

## Manual modal behavior

Do not separately recreate:

- Portal
- Focus trap
- Escape handler
- Body lock
- Focus restoration

Use `Modal`.

## Hidden errors

Do not catch errors and silently ignore them when the user needs feedback.

## Giant feature file

A file is too broad when it mixes:

- API calls
- Query hooks
- Huge SVG icon library
- Multiple dialogs
- Form state
- Several major UI sections
- Utility algorithms

Split by responsibility, not only by line count.

---

# 32. AI instruction prompt

Copy the following prompt when asking an AI to create or modify an Imminiq frontend module.

```text
You are working on the Imminiq React + TypeScript frontend.

FIRST:
1. Read FRONTEND_ARCHITECTURE_AND_AI_GUIDE.md completely.
2. Inspect every supplied file and the closest existing module before changing code.
3. Do not guess component APIs; open the shared component files first.

NON-NEGOTIABLE ARCHITECTURE:
- Preserve all current behavior, routes, API contracts, and public exports unless I explicitly request a breaking change.
- Use TanStack Query for server data.
- Never copy query/server data into Zustand.
- Use URL search parameters for shareable search, filters, sort, tabs, scope, and pagination.
- Use local React state for small temporary UI state.
- Use a module Zustand store only for a genuine multi-screen client draft/workflow.
- Use root Zustand stores only for application-wide client state.
- Use the shared Axios client from src/lib/axios.ts.
- Use query-key factories and invalidate the smallest correct query family.
- Disable mutation buttons while pending and prevent duplicate submissions.
- Use the target module's index.ts for cross-module imports; do not deep-import another module's internals.

LAYOUT AND DESIGN:
- Normal authenticated pages are already inside AuthenticatedAppLayout. Do not add a second sidebar, top bar, footer, or bottom navigation.
- Use PageContainer, PageHeader, SectionCard, SectionHeader, StatGrid, StatCard, Button, IconButton, UserAvatar, FilterBar, SearchInput, Pagination, EmptyState, ErrorState, SkeletonBlock, Modal, and ConfirmDialog before creating duplicate UI.
- Use semantic CSS tokens from index.css.
- Follow the standard radius, shadow, typography, and surface system.
- Use ImminiqLogo and ImminiqWordmark for branding. Only “iq” is rust in the wordmark.
- Keep desktop and mobile spacing consistent with PageContainer.
- Do not add arbitrary hardcoded colors/radii when a token exists.

ACCESSIBILITY:
- Use semantic elements.
- Add labels to icon-only buttons.
- Preserve keyboard navigation and visible focus.
- Use the shared Modal for focus trap, Escape handling, portal, body lock, and focus restoration.
- Respect prefers-reduced-motion.

QUALITY:
- Keep pages as coordinators; move API logic into hooks, types into types, constants into constants, formatting/validation into utils, and reusable feature UI into components.
- Do not mix unrelated cleanup into the requested feature.
- Do not remove existing features to make the task easier.
- Do not create placeholder routes or fake API data.
- Keep focused lesson/test workspaces full-height and free from normal app footer/sidebar unless explicitly required.

DELIVERY:
- Show every changed file.
- Explain state ownership and cache invalidation.
- Run typecheck, lint, tests if available, and production build.
- Report anything that could not be live-tested.
- Before finishing, verify responsive behavior, loading, empty, error, pending, success, keyboard, and dark-mode states.
```

## More specific AI request template

```text
Task: [describe the feature]
Module: [module name]
Routes affected: [paths]
Backend endpoints: [methods and paths]
Required behavior: [details]
Do not change: [protected behavior/contracts]

Use FRONTEND_ARCHITECTURE_AND_AI_GUIDE.md as the source of truth and return complete code for every modified file.
```

---

# 33. Quick reference

## Where does this state belong?

```text
Backend response?                 TanStack Query
Search/filter/page in URL?        useSearchParams
Auth/sidebar/theme?               Root Zustand
Multi-step module draft?          Module Zustand
Single component interaction?     useState/useReducer
Durable browser preference?       Safe storage through store/helper
Current-session workflow?         Session-persisted module store
```

## What component should I use?

```text
Normal page width/spacing          PageContainer
Page title and actions             PageHeader
Content section                    SectionCard
Section title/action               SectionHeader
Statistics                         StatGrid + StatCard
Avatar                             UserAvatar
Primary/secondary action           Button
Icon-only action                   IconButton
Search                             SearchInput
Filters                            FilterBar
Tabs                               PillTabs/NavPillTabs
Pagination                         Pagination
No data                            EmptyState
Fetch failure                      ErrorState
Loading placeholder                SkeletonBlock
Popup                              Modal
Destructive confirmation           ConfirmDialog
Feedback                           Root toast API
Logo                               ImminiqLogo
Wordmark                           ImminiqWordmark
```

## Which route file?

```text
No authentication                  public.routes.tsx
Protected normal app page          authenticated.routes.tsx
Protected distraction-free page    focused.routes.tsx
Protected tracker-creation flow    tracker-creation.routes.tsx
Admin-only page                    admin.routes.tsx
```

## Final rule

Before writing new UI, search the shared root components and the nearest existing module. Reuse the architecture; do not reproduce it.
