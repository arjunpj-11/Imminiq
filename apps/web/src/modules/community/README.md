# Community Frontend Module

Generated from the Community browse and Verify & Earn mock pages using the frontend module consistency rules.

## Pages

```txt
src/modules/community/pages/CommunityBrowsePage.tsx
src/modules/community/pages/VerifyAndEarnPage.tsx
src/modules/community/pages/CommunityVerifySubmissionPage.tsx
```

## Suggested route registration

Add these lazy imports wherever your app routes are defined:

```tsx
const CommunityBrowsePage = lazy(
  () => import('./modules/community/pages/CommunityBrowsePage')
)
const VerifyAndEarnPage = lazy(
  () => import('./modules/community/pages/VerifyAndEarnPage')
)
const CommunityVerifySubmissionPage = lazy(
  () => import('./modules/community/pages/CommunityVerifySubmissionPage')
)
```

Suggested routes:

```tsx
<Route path="/community" element={<CommunityBrowsePage />} />
<Route path="/verify-and-earn" element={<VerifyAndEarnPage />} />
<Route
  path="/community/verify/:submissionId"
  element={<CommunityVerifySubmissionPage />}
/>
```

## Backend endpoints used

```txt
GET  /community
POST /community/trackers/:trackerId/clone
GET  /community/verify/dashboard
GET  /community/verify/:submissionId
POST /community/verify/:submissionId/vote
```

The shared axios instance is expected to already prefix `/api`, matching the existing frontend module style.
