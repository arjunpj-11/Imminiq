import { env } from '../../config/env';

export type LearningVideoRecommendation = {
  videoId: string;
  title: string;
  url: string;
  channelTitle: string;
  thumbnailUrl: string;
  durationSeconds: number;
};

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
  }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      description?: string;
      channelTitle?: string;
      thumbnails?: {
        medium?: { url?: string };
        high?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
    status?: { embeddable?: boolean; privacyStatus?: string };
  }>;
};

const STOP_WORDS = new Set([
  'and',
  'for',
  'from',
  'into',
  'the',
  'with',
  'your',
  'zero',
  'hero',
  'roadmap',
  'interview',
  'preparation',
  'complete',
  'mastery',
  'module',
  'topic',
  'chapter',
  'unit',
]);

const cleanTopicTitle = (value: string) =>
  value
    .replace(/^\s*(?:module|topic|chapter|unit)\s*\d+\s*[:.)–—-]?\s*/i, '')
    .replace(/^\s*\d+\s*[.:)–—-]\s*/, '')
    .trim();

const cleanTrackerSubject = (value: string) =>
  value
    .replace(/\bzero\s*[-–—]?\s*to\s*[-–—]?\s*hero\b/gi, '')
    .replace(
      /\b(master|mastery|complete|ultimate|roadmap|learning path|journey|preparation)\b/gi,
      ''
    )
    .replace(/\s{2,}/g, ' ')
    .trim();

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

const parseIsoDuration = (value = '') => {
  const match = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;

  return (
    Number(match[1] || 0) * 86_400 +
    Number(match[2] || 0) * 3_600 +
    Number(match[3] || 0) * 60 +
    Number(match[4] || 0)
  );
};

const fetchYouTubeJson = async <T>(url: URL): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.YOUTUBE_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const findTopicLearningVideo = async (
  trackerTitle: string,
  topicTitle: string,
  contextTitle?: string
): Promise<LearningVideoRecommendation | null> => {
  const cleanTopic = cleanTopicTitle(topicTitle);
  const cleanSubject = cleanTrackerSubject(trackerTitle);
  const cleanContext = cleanTopicTitle(contextTitle || '');
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.search = new URLSearchParams({
    part: 'snippet',
    q: `${cleanTopic} ${cleanContext} ${cleanSubject} full chapter tutorial`
      .replace(/\s{2,}/g, ' ')
      .trim(),
    type: 'video',
    order: 'relevance',
    maxResults: String(env.YOUTUBE_MAX_RESULTS),
    safeSearch: 'strict',
    videoEmbeddable: 'true',
    relevanceLanguage: 'en',
    key: env.YOUTUBE_DATA_API_KEY,
  }).toString();

  const search = await fetchYouTubeJson<YouTubeSearchResponse>(searchUrl);
  const videoIds = (search.items || [])
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) return null;

  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
  videosUrl.search = new URLSearchParams({
    part: 'snippet,contentDetails,statistics,status',
    id: videoIds.join(','),
    key: env.YOUTUBE_DATA_API_KEY,
  }).toString();

  const videos = await fetchYouTubeJson<YouTubeVideosResponse>(videosUrl);
  const topicTokens = [...new Set(tokenize(cleanTopic))];
  if (topicTokens.length === 0) return null;

  const candidates = (videos.items || []).flatMap((video) => {
    const title = video.snippet?.title?.trim() || '';
    const searchableText = `${title} ${video.snippet?.description || ''}`.toLowerCase();
    const matchedTokens = topicTokens.filter((token) => searchableText.includes(token));
    const coverage = matchedTokens.length / topicTokens.length;
    const minimumCoverage = topicTokens.length <= 2 ? 1 : 0.6;
    const durationSeconds = parseIsoDuration(video.contentDetails?.duration);

    if (
      !video.id ||
      !title ||
      coverage < minimumCoverage ||
      durationSeconds < 8 * 60 ||
      video.status?.embeddable !== true ||
      video.status?.privacyStatus !== 'public'
    ) {
      return [];
    }

    const views = Number(video.statistics?.viewCount || 0);
    const score = coverage * 100 + Math.min(25, Math.log10(views + 1) * 4);
    const thumbnails = video.snippet?.thumbnails;

    return [
      {
        score,
        recommendation: {
          videoId: video.id,
          title,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          channelTitle: video.snippet?.channelTitle?.trim() || 'YouTube',
          thumbnailUrl:
            thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || '',
          durationSeconds,
        },
      },
    ];
  });

  candidates.sort((first, second) => second.score - first.score);
  return candidates[0]?.recommendation || null;
};

export const findTrackerTopicLearningVideos = async (input: {
  trackerTitle: string;
  topics: Array<{ title: string; order: number }>;
  maxRecommendations?: number;
}): Promise<Map<number, LearningVideoRecommendation>> => {
  const recommendations = new Map<number, LearningVideoRecommendation>();
  if (!env.YOUTUBE_DATA_API_KEY) return recommendations;

  // Keep generation latency and YouTube quota bounded. The earliest roadmap
  // domains are normally the most useful places for a long-form companion video.
  const topicsToSearch = input.topics.slice(0, input.maxRecommendations ?? 6);

  await Promise.all(
    topicsToSearch.map(async (topic) => {
      try {
        const video = await findTopicLearningVideo(input.trackerTitle, topic.title);
        if (video) recommendations.set(topic.order, video);
      } catch (error) {
        // Video enrichment is optional and must never prevent tracker creation.
        console.warn(`[YouTube] Could not enrich topic “${topic.title}”:`, error);
      }
    })
  );

  return recommendations;
};

export const findTrackerSubtopicLearningVideos = async (input: {
  trackerTitle: string;
  subtopics: Array<{
    key: string;
    title: string;
    parentTopicTitle: string;
  }>;
  maxRecommendations?: number;
}): Promise<Map<string, LearningVideoRecommendation>> => {
  const recommendations = new Map<string, LearningVideoRecommendation>();
  if (!env.YOUTUBE_DATA_API_KEY) return recommendations;

  const subtopicsToSearch = input.subtopics.slice(0, input.maxRecommendations ?? 8);

  await Promise.all(
    subtopicsToSearch.map(async (subtopic) => {
      try {
        const video = await findTopicLearningVideo(
          input.trackerTitle,
          subtopic.title,
          subtopic.parentTopicTitle
        );
        if (video) recommendations.set(subtopic.key, video);
      } catch (error) {
        console.warn(`[YouTube] Could not enrich subtopic “${subtopic.title}”:`, error);
      }
    })
  );

  return recommendations;
};
