import { Flag, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { safeLocalStorage } from '../../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../../lib/storage/storage-keys';
import { ROUTES } from '../../../../../routes/config/route-paths';
import { cn } from '../../../../../lib/cn';

export default function LessonFeedbackCard({
  trackerId,
  subtopicId,
  lessonTitle,
}: {
  trackerId: string;
  subtopicId: string;
  lessonTitle: string;
}) {
  const navigate = useNavigate();
  const storageKey = `${STORAGE_KEYS.lessonFeedbackPrefix}:${trackerId}:${subtopicId}`;
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(
    () => (safeLocalStorage.get(storageKey) as 'helpful' | 'not_helpful' | null) ?? null
  );
  const [reason, setReason] = useState<string | null>(null);

  const choose = (value: 'helpful' | 'not_helpful') => {
    setRating(value);
    safeLocalStorage.set(storageKey, value);
  };

  return (
    <section className="rounded-xl border border-(--border-subtle) bg-(--surface-card) p-4 shadow-(--shadow-1)">
      <h2 className="text-[13px] font-bold text-(--text-primary)">Was this explanation helpful?</h2>
      <p className="mt-1 text-[10px] leading-5 text-(--text-muted)">
        Your rating is saved on this device and helps you remember which lessons need another pass.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(
          [
            ['helpful', 'Yes', ThumbsUp],
            ['not_helpful', 'Not yet', ThumbsDown],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={rating === value}
            className={cn(
              'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border text-[11px] font-bold transition',
              rating === value
                ? 'border-(--brand-500) bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] text-(--brand-500)'
                : 'border-(--border-subtle) text-(--text-secondary) hover:border-(--brand-500)'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>
      {rating === 'not_helpful' && (
        <div className="mt-3" aria-live="polite">
          <p className="text-[12px] font-bold text-(--text-primary)">What needs another pass?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['Too advanced', 'Not enough examples', 'Unclear wording', 'Possibly outdated'].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  aria-pressed={reason === option}
                  className={cn(
                    'min-h-9 rounded-full border px-3 text-[11px] font-bold transition',
                    reason === option
                      ? 'border-(--brand-500) bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)] text-(--brand-500)'
                      : 'border-(--border-subtle) text-(--text-secondary) hover:border-(--brand-500)'
                  )}
                >
                  {option}
                </button>
              )
            )}
          </div>
          {reason && (
            <p className="mt-2 text-[11px] leading-5 text-(--text-muted)">
              Noted for this session. Use the report option below if you want the team to review it.
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          const params = new URLSearchParams({
            category: 'learning',
            subject: `Lesson feedback: ${lessonTitle}`,
            description: `I found an issue in “${lessonTitle}”.\n\nTracker: ${trackerId}\nLesson: ${subtopicId}\n\nWhat was confusing or outdated:\n`,
          });
          navigate(`${ROUTES.support}?${params.toString()}`);
        }}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-bold text-(--text-muted) transition hover:bg-(--surface-muted) hover:text-(--danger)"
      >
        <Flag size={13} />
        Report confusing or outdated content
      </button>
    </section>
  );
}
