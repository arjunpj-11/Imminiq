import { describe, expect, it } from 'vitest';

import { resolveOutgoingMessageKind } from './resolve-outgoing-message-kind';

describe('resolveOutgoingMessageKind', () => {
  it('keeps recorded audio classified as a voice message', () => {
    expect(
      resolveOutgoingMessageKind('voice', { type: 'audio/webm' })
    ).toBe('voice');
  });

  it('classifies regular image and document attachments', () => {
    expect(
      resolveOutgoingMessageKind('text', { type: 'image/png' })
    ).toBe('image');
    expect(
      resolveOutgoingMessageKind('text', { type: 'application/pdf' })
    ).toBe('file');
  });
});
