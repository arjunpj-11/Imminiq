import { describe, expect, it } from 'vitest';

import {
  buildYouTubeEmbedUrl,
  resolveYouTubeVideoId,
} from '../../../../../src/modules/user/trackers/utils/youtube-video';

describe('YouTube learning video embeds', () => {
  it('builds a privacy-enhanced autoplay embed from a video id', () => {
    expect(buildYouTubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1'
    );
  });

  it('recovers an id from supported YouTube URLs', () => {
    expect(resolveYouTubeVideoId('', 'https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(resolveYouTubeVideoId('', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it('rejects non-YouTube and malformed video references', () => {
    expect(resolveYouTubeVideoId('', 'https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(buildYouTubeEmbedUrl('invalid')).toBeNull();
  });
});
