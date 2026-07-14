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
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border transition',
        size === 'sm' ? 'h-9 w-9' : 'h-10 w-10',
        isListening
          ? 'border-red-400 bg-red-500/10 text-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.10)] dark:border-red-400/60 dark:text-red-400'
          : 'border-(--border-subtle) text-(--text-secondary) hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)'
      )}
    >
      {isListening && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-red-500/10"
          />

          <span
            aria-hidden="true"
            className="absolute bottom-1.5 left-1/2 flex h-4 -translate-x-1/2 items-end gap-0.5"
          >
            <span className="h-1.5 w-0.75 animate-[voiceWave_0.55s_ease-in-out_infinite] rounded-full bg-current opacity-70" />
            <span className="h-3 w-0.75 animate-[voiceWave_0.7s_ease-in-out_infinite] rounded-full bg-current opacity-90" />
            <span className="h-2 w-0.75 animate-[voiceWave_0.6s_ease-in-out_infinite] rounded-full bg-current opacity-80" />
            <span className="h-3.5 w-0.75 animate-[voiceWave_0.8s_ease-in-out_infinite] rounded-full bg-current opacity-90" />
          </span>

          <style>
            {`
              @keyframes voiceWave {
                0%, 100% {
                  transform: scaleY(0.45);
                }

                50% {
                  transform: scaleY(1.35);
                }
              }
            `}
          </style>
        </>
      )}

      <span className={cn('relative z-10', isListening && 'mb-3')}>
        {isListening ? (
          <StopIcon className="h-4 w-4" />
        ) : (
          <MicIcon className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'} />
        )}
      </span>
    </button>
  );
}
