const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export const resolveYouTubeVideoId = (videoId: string, videoUrl?: string): string | null => {
  const normalizedId = videoId.trim();
  if (YOUTUBE_VIDEO_ID_PATTERN.test(normalizedId)) return normalizedId;
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname.replace(/^www\./, '');
    let candidate = '';

    if (hostname === 'youtu.be') {
      candidate = url.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      candidate =
        url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? '';
    }

    return YOUTUBE_VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
};

export const buildYouTubeEmbedUrl = (videoId: string, videoUrl?: string): string | null => {
  const resolvedId = resolveYouTubeVideoId(videoId, videoUrl);
  if (!resolvedId) return null;

  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
  });

  return `https://www.youtube-nocookie.com/embed/${resolvedId}?${params.toString()}`;
};
