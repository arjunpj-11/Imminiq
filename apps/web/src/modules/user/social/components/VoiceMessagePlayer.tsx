import { LoaderCircle, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../../../lib/cn';
import type { IChatAttachment } from '../types/chat.types';
import { loadChatMediaBlob } from '../utils/download-chat-media';

const formatPlaybackTime = (value: number) => {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return `${Math.floor(safeValue / 60)}:${String(safeValue % 60).padStart(2, '0')}`;
};

export default function VoiceMessagePlayer({
  attachment,
  mine,
}: {
  attachment: IChatAttachment;
  mine: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(attachment.durationSeconds ?? 0);

  useEffect(() => {
    let active = true;

    void loadChatMediaBlob(attachment.url, attachment.mimeType)
      .then((blob) => {
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        const audio = audioRef.current;
        if (audio) {
          audio.src = objectUrl;
          audio.load();
        }
        setIsReady(true);
      })
      .catch(() => {
        if (active) {
          setIsReady(false);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    };
  }, [attachment.mimeType, attachment.url, retryToken]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) return;
    if (loadFailed || !isReady || !objectUrlRef.current) {
      setIsLoading(true);
      setLoadFailed(false);
      setIsReady(false);
      setRetryToken((value) => value + 1);
      return;
    }
    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      setLoadFailed(false);
      await audio.play();
    } catch {
      setLoadFailed(true);
      setIsPlaying(false);
    }
  };

  const seek = async (value: number) => {
    const audio = audioRef.current;
    if (!audio || !objectUrlRef.current) return;
    try {
      audio.currentTime = value;
      setCurrentTime(value);
    } catch {
      setLoadFailed(true);
    }
  };

  const resolvedDuration =
    duration || attachment.durationSeconds || Math.max(1, currentTime);

  return (
    <div className="flex w-[min(270px,70vw)] min-w-0 items-center gap-3 py-1 pr-3">
      <button
        type="button"
        onClick={() => void togglePlayback()}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition hover:scale-[1.03]',
          mine
            ? 'bg-white/90 text-(--brand-600) dark:bg-black/75 dark:text-white'
            : 'bg-(--brand-500) text-(--brand-contrast)'
        )}
        aria-label={
          loadFailed
            ? 'Retry voice message'
            : isPlaying
              ? 'Pause voice message'
              : 'Play voice message'
        }
      >
        {isLoading ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : loadFailed ? (
          <RotateCcw size={16} />
        ) : isPlaying ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="translate-x-px" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={Math.max(1, resolvedDuration)}
          step={0.1}
          value={Math.min(currentTime, Math.max(1, resolvedDuration))}
          onChange={(event) => void seek(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-current"
          aria-label="Voice message position"
        />
        <div className="mt-1 flex items-center justify-between gap-3 font-mono text-[8px] opacity-70">
          <span>
            {loadFailed
              ? 'Could not load · tap retry'
              : isReady
                ? isPlaying
                  ? 'Playing'
                  : 'Ready'
                : 'Tap to load and play'}
          </span>
          <span>
            {formatPlaybackTime(currentTime)} / {formatPlaybackTime(resolvedDuration)}
          </span>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="none"
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration)) {
            setDuration(event.currentTarget.duration);
          }
        }}
        onError={() => {
          if (objectUrlRef.current) setLoadFailed(true);
        }}
      >
        Your browser does not support in-chat audio playback.
      </audio>
    </div>
  );
}
