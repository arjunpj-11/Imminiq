import { describe, expect, it } from 'vitest';

import { canAddAiVerifiedItem } from '../../../../../src/modules/user/trackers/utils/tracker-roadmap-normalizers';

describe('tracker AI verification override', () => {
  it('allows approved topics and explicitly overridden rejected topics', () => {
    expect(
      canAddAiVerifiedItem({
        hasTitle: true,
        verificationStatus: 'approved',
        allowRejected: false,
        pending: false,
      })
    ).toBe(true);
    expect(
      canAddAiVerifiedItem({
        hasTitle: true,
        verificationStatus: 'rejected',
        allowRejected: true,
        pending: false,
      })
    ).toBe(true);
  });

  it('never bypasses a missing title, pending request, or unfinished verification', () => {
    expect(
      canAddAiVerifiedItem({
        hasTitle: false,
        verificationStatus: 'rejected',
        allowRejected: true,
        pending: false,
      })
    ).toBe(false);
    expect(
      canAddAiVerifiedItem({
        hasTitle: true,
        verificationStatus: 'rejected',
        allowRejected: true,
        pending: true,
      })
    ).toBe(false);
    expect(
      canAddAiVerifiedItem({
        hasTitle: true,
        verificationStatus: 'idle',
        allowRejected: true,
        pending: false,
      })
    ).toBe(false);
  });
});
