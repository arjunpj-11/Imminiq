import { useState } from 'react';

import type { ILearningVideo } from '../types/tracker.types';
import { buildYouTubeEmbedUrl } from '../utils/youtube-video';

type EmbeddedLearningVideoProps = {
  video: ILearningVideo;
  className?: string;
};

export default function EmbeddedLearningVideo({
  video,
  className = '',
}: EmbeddedLearningVideoProps) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = buildYouTubeEmbedUrl(video.videoId, video.url);

  if (!embedUrl) return null;

  if (playing) {
    return (
      <section
        className={`mt-3 overflow-hidden rounded-xl border border-red-500/20 bg-black shadow-sm ${className}`}
        aria-label={`Playing ${video.title}`}
      >
        <div className="relative aspect-video w-full">
          <iframe
            src={embedUrl}
            title={video.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <div className="flex items-center justify-between gap-3 bg-(--surface-card) px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold text-(--text-primary)">{video.title}</p>
            <p className="truncate text-[10px] text-(--text-secondary)">{video.channelTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="shrink-0 rounded-lg border border-(--border-subtle) px-3 py-1.5 text-[11px] font-bold text-(--text-secondary) transition hover:border-red-500/30 hover:text-red-600"
            aria-label={`Close ${video.title}`}
          >
            Close video
          </button>
        </div>
      </section>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className={`mt-3 flex w-full items-center gap-3 overflow-hidden rounded-xl border border-red-500/20 bg-(--surface-card) p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-md ${className}`}
      aria-label={`Play ${video.title} here`}
    >
      <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-black/10">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex h-8 w-11 items-center justify-center rounded-lg bg-red-600 text-xs text-white shadow-md">
            ▶
          </span>
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 block font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-red-600 dark:text-red-400">
          Play here
        </span>
        <span className="line-clamp-2 block text-[12px] font-bold leading-snug text-(--text-primary)">
          {video.title}
        </span>
        <span className="mt-1 block truncate text-[10px] text-(--text-secondary)">
          {video.channelTitle}
        </span>
      </span>
    </button>
  );
}
