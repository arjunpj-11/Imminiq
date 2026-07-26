import { describe, expect, it } from 'vitest';

import { CALL_ENDPOINTS } from '../../../../../src/modules/user/social/constants/calls.constants';

describe('social call endpoint paths', () => {
  it('stays relative to the configured /api base URL', () => {
    const callId = '507f1f77bcf86cd799439011';

    expect(CALL_ENDPOINTS.root).toBe('/calls');
    expect(CALL_ENDPOINTS.active).toBe('/calls/active');
    expect(CALL_ENDPOINTS.respond(callId)).toBe(`/calls/${callId}/respond`);
    expect(CALL_ENDPOINTS.end(callId)).toBe(`/calls/${callId}/end`);
  });
});
