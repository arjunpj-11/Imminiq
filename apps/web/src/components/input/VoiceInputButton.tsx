import { cn } from '../../lib/cn';

// ─── SVG icons ───────────────────────────────────────────────────────────────

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 14.75c1.9 0 3.4-1.5 3.4-3.4v-5.2c0-1.9-1.5-3.4-3.4-3.4s-3.4 1.5-3.4 3.4v5.2c0 1.9 1.5 3.4 3.4 3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5.75 10.75c0 3.45 2.8 6.25 6.25 6.25s6.25-2.8 6.25-6.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      <path d="M8.75 21h6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="7" y="7" width="10" height="10" rx="2.2" fill="currentColor" />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface IMicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

// ─── Mic button ──────────────────────────────────────────────────────────────

export function MicButton({ isListening, isSupported, onToggle, size = 'md' }: IMicButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isListening ? 'Stop listening' : 'Voice input'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      aria-pressed={isListening}
      className={cn(
        'relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-(--shadow-1) transition-[color,background-color,border-color,box-shadow,transform] hover:-translate-y-px focus-visible:outline-none',
        size === 'sm' ? 'h-10 w-10' : 'h-11 w-11',
        isListening
          ? 'border-(--danger) bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface-elevated))] text-(--danger) shadow-[0_0_0_4px_color-mix(in_srgb,var(--danger)_12%,transparent)]'
          : 'border-(--border-subtle) bg-(--surface-elevated) text-(--text-secondary) hover:border-(--brand-500) hover:bg-[color-mix(in_srgb,var(--brand-500)_8%,var(--surface-elevated))] hover:text-(--brand-500)'
      )}
    >
      {isListening && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-1 animate-ping rounded-full bg-[color-mix(in_srgb,var(--danger)_10%,transparent)]"
          />

          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-1/2 flex h-2.5 -translate-x-1/2 items-end gap-0.5"
          >
            <span className="voice-wave h-1.5 w-0.75 rounded-full bg-current opacity-70" />
            <span className="voice-wave h-2.5 w-0.75 rounded-full bg-current opacity-90 [animation-delay:-.18s]" />
            <span className="voice-wave h-2 w-0.75 rounded-full bg-current opacity-80 [animation-delay:-.32s]" />
          </span>
        </>
      )}

      <span className={cn('relative z-10 transition-transform', isListening && '-translate-y-1.5')}>
        {isListening ? (
          <StopIcon className="h-4 w-4" />
        ) : (
          <MicIcon className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'} />
        )}
      </span>
    </button>
  );
}
