import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/env', () => ({
  env: { YOUTUBE_DATA_API_KEY: 'test-youtube-key' },
}));

import {
  findTrackerSubtopicLearningVideos,
  findTrackerTopicLearningVideos,
} from '../../src/infrastructure/youtube/youtube-learning-video.service';

describe('YouTube learning video recommendations', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('stores a verified, embeddable, relevant long-form video', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: 'video-123' } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'video-123',
              snippet: {
                title: 'JavaScript Fundamentals Full Course',
                description: 'Learn JavaScript fundamentals from scratch.',
                channelTitle: 'Trusted Learning',
                thumbnails: { medium: { url: 'https://img.youtube.com/video-123.jpg' } },
              },
              contentDetails: { duration: 'PT1H20M' },
              statistics: { viewCount: '250000' },
              status: { embeddable: true, privacyStatus: 'public' },
            },
          ],
        }),
      });

    const result = await findTrackerTopicLearningVideos({
      trackerTitle: 'Complete Full Stack Development Zero-to-Hero Roadmap',
      topics: [{ title: 'Module 1: JavaScript Fundamentals', order: 1 }],
    });

    expect(result.get(1)).toEqual({
      videoId: 'video-123',
      title: 'JavaScript Fundamentals Full Course',
      url: 'https://www.youtube.com/watch?v=video-123',
      channelTitle: 'Trusted Learning',
      thumbnailUrl: 'https://img.youtube.com/video-123.jpg',
      durationSeconds: 4800,
    });
    const searchUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(searchUrl.searchParams.get('q')).toBe(
      'JavaScript Fundamentals Full Stack Development full chapter tutorial'
    );
    expect(searchUrl.searchParams.get('videoEmbeddable')).toBe('true');
    expect(searchUrl.searchParams.has('videoSyndicated')).toBe(false);
  });

  it('rejects short or weakly matched videos', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: 'short-1' } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'short-1',
              snippet: { title: 'Unrelated motivational clip' },
              contentDetails: { duration: 'PT45S' },
              statistics: { viewCount: '9000000' },
              status: { embeddable: true, privacyStatus: 'public' },
            },
          ],
        }),
      });

    const result = await findTrackerTopicLearningVideos({
      trackerTitle: 'Backend Engineering',
      topics: [{ title: 'Database Indexing', order: 2 }],
    });

    expect(result.size).toBe(0);
  });

  it('uses the parent topic as context for a dedicated subtopic video', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ id: { videoId: 'history-1' } }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'history-1',
              snippet: {
                title: 'French Revolution and Nationalism Explained',
                description: 'A complete lesson about the French Revolution.',
                channelTitle: 'History Classroom',
                thumbnails: { medium: { url: 'https://img.youtube.com/history-1.jpg' } },
              },
              contentDetails: { duration: 'PT35M' },
              statistics: { viewCount: '80000' },
              status: { embeddable: true, privacyStatus: 'public' },
            },
          ],
        }),
      });

    const result = await findTrackerSubtopicLearningVideos({
      trackerTitle: 'CBSE Class 10 History Exam Preparation',
      subtopics: [
        {
          key: '1:1',
          title: 'Chapter 1: French Revolution',
          parentTopicTitle: 'The Rise of Nationalism in Europe',
        },
      ],
    });

    expect(result.get('1:1')?.videoId).toBe('history-1');
    const searchUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(searchUrl.searchParams.get('q')).toBe(
      'French Revolution The Rise of Nationalism in Europe CBSE Class 10 History Exam full chapter tutorial'
    );
  });
});
