# Admin UI production upgrade

The existing dark brown and coral Imminiq admin theme has been retained and hardened into a reusable admin design system.

## Main improvements

- Added shared semantic design tokens, consistent surfaces, borders, spacing, focus states, hover/pressed effects, reduced-motion support, and responsive styling.
- Rebuilt the admin shell with a scrollable mobile drawer, body scroll locking, Escape support, accessible navigation controls, a sticky header, and a skip link.
- Standardized page headers, metric cards, panels, search, form controls, status badges, tables, pagination, loading, empty, and retry states.
- Added responsive table behavior with sticky headers, sticky identity columns, touch-friendly controls, and horizontal-scroll affordances.
- Added accessible table captions and column scopes, visible keyboard focus, labelled icon controls, live loading/pagination feedback, and accessible chart summaries.
- Upgraded dashboard, analytics, and AI spend charts with visible values, labels, keyboard focus, and richer hover states.
- Added URL-backed search/filter/page state to primary admin directories so filtered views survive refreshes and browser navigation.
- Added bulk-action previews, cross-page selection disclosure, required reasons, six-digit MFA validation, and safer selection resets.
- Added unsaved-change protection and review-before-save flows for global settings and subscription plan changes.
- Added sensitive audit metadata redaction and spreadsheet-formula neutralization in CSV exports.
- Replaced custom fixed overlays in audit and support workflows with the shared accessible modal.
- Formatted the full admin module for maintainability.

## Integration notes

- The supplied archive contains only the admin frontend module. It does not include the parent application's package configuration, external shared components, route guards, backend, or automated test setup.
- All local admin imports resolve, and every TypeScript/TSX file passes an isolated TypeScript transpile syntax check.
- Run the parent application's normal typecheck, lint, unit, end-to-end, and production build commands after replacing its admin folder.
- Server-side authorization, MFA enforcement, audit redaction, export limits, and administrator route guards must remain enforced by the backend even though the frontend now provides corresponding safeguards.

## Sidebar and partial-loading revision

- Replaced the non-functional shell control with a single responsive sidebar toggle.
  - On desktop it collapses and expands the navigation while preserving the preference in local storage.
  - On mobile it opens and closes the drawer, supports backdrop click and Escape, and uses a clear back arrow inside the drawer.
- Removed the notification bell from the top bar.
- Added compact tooltips and accessible labels when the desktop sidebar is collapsed.
- Added reusable metric-card, table-row, and list skeletons.
- Added React Query previous-data placeholders to subscriptions, analytics, AI spend, and content appeals.
- Filter and pagination changes now replace only the affected list/table with a skeleton. Page headers, filters, metrics, plan cards, and unrelated panels remain mounted.
- Silent background refetches keep existing content visible instead of flashing the full page.
- Added localized skeleton states across users, subscriptions, trackers, mock tests, moderation reports, audit logs, support tickets, broadcasts, appeals, privacy requests, and community reviews.

## Viewport-safe admin dialogs

- All admin modals now use the local `AdminModal` component.
- Dialog width and height are constrained to the visible viewport, including dynamic mobile viewport height.
- Long dialog content scrolls inside the popup while the page behind it remains locked.
- Nested dialogs use a modal stack so only the top dialog handles Escape and keyboard focus.
- Focus is trapped inside the active dialog and restored when it closes.
- Admin confirmation dialogs use the same responsive popup behavior.


## PDF export revision

- Added branded PDF exports beside CSV exports for users, trackers, mock tests, and the complete subscription purchase ledger.
- PDF reports include the active search/status filters, generation time, summary metrics, and paginated table rows.
- Users, trackers, and mock-test PDF exports load all matching backend pages instead of exporting only the visible table page.
- Subscription PDF and CSV exports share the same complete filtered ledger fetch so both formats contain equivalent records.
- Client PDF generation uses the existing `jspdf` and `jspdf-autotable` integration already used by analytics, AI token-spend, and audit reports.
