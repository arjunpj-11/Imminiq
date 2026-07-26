# Imminiq product polish standard

This is the release standard for both the learner experience and the admin console. It is a
quality gate, not a feature backlog.

## Product language

- Use **Tracker** for a learning roadmap and **Guild** for its learning community.
- Use **Ask Immi** for the adaptive learning assistant.
- Use **Verification Queue** for community tracker verification work.
- Use **Question Report Queue** and **Tracker Report Queue** for moderation inboxes.
- Account states are **Active**, **Suspended**, **Blocked**, and **Deactivated** in visible copy.
  Internal persistence names may differ, but they must never leak into the interface.
- Page titles, navigation labels, browser titles, notifications, email, and audit descriptions use
  the same terms.

## Voice

### Learner experience

Write with calm encouragement. Explain the next useful action and avoid blame.

- Prefer: “Your answer is still here. Reconnect and try again.”
- Avoid: “Request failed.”

### Admin console

Write with operational precision. Name the affected record, scope, consequence, reversibility,
and notification behavior.

- Prefer: “Suspend this tracker. Existing learners keep their progress, but new access and sharing
  stop until it is restored.”
- Avoid: “Are you sure?”

### Errors and moderation

- Say what happened.
- Say whether existing information is safe.
- Say whether retrying is safe.
- Give one clear next action.
- Do not expose internal service, database, provider, or stack-trace terminology.

## Required page states

Every data view must deliberately support:

- Initial loading
- Background refresh without removing existing content
- Empty collection
- No filter or search matches
- Offline
- Permission denied
- Maintenance pause
- Recoverable error with retry
- Successful mutation confirmation

## Administrative action safety

For suspensions, blocks, deletions, restores, plan changes, and global settings:

- Identify the affected user or content.
- Summarize current and proposed state.
- State the user-visible consequence.
- State whether the action is reversible.
- Require an audit reason for consequential changes.
- Require step-up verification where configured.
- Disable repeated submission while processing.
- Keep administrative access to records when a user feature is paused.

## Responsive and accessibility gate

- The learner experience works from 320px upward without horizontal page scrolling.
- Admin tables prioritize essential columns and clearly indicate horizontal overflow.
- Interactive controls are at least 44px high on small screens.
- Keyboard focus is always visible.
- Dialog focus is contained and restored to the triggering control.
- Status is communicated with text, not color alone.
- Loading and mutation status is announced to assistive technology.
- Heading order is logical and there is one primary page heading.
- Reduced-motion and forced-color modes remain usable.

## Release review

Before marking a page complete, verify:

- Navigation label, page title, and browser title match.
- Realistic long names, descriptions, emails, and identifiers wrap safely.
- Loading, empty, no-results, error, offline, and maintenance states.
- Keyboard-only completion of the primary workflow.
- Light and dark themes where applicable.
- Phone, tablet, small laptop, and desktop layouts.
- Destructive-action consequence and recovery copy.
- Data freshness, result count, and active filters on operational lists.
- User-facing preview for admin-managed content where privacy permits.
- No private message, call, saved-item, or device-local data is exposed to administrators.
