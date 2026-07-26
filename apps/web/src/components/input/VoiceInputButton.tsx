import { cn } from '../../lib/cn';
import type { VoiceInputPhase } from '../../hooks/useVoiceInput';

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
  phase?: VoiceInputPhase;
  isSupported: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

// ─── Mic button ──────────────────────────────────────────────────────────────

export function MicButton({
  isListening,
  phase = isListening ? 'listening' : 'idle',
  isSupported,
  onToggle,
  size = 'md',
}: IMicButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={phase === 'requesting' || phase === 'transcribing'}
      title={
        phase === 'transcribing'
          ? 'Transcribing voice'
          : isListening
            ? 'Stop listening'
            : 'Voice input'
      }
      aria-label={
        phase === 'transcribing'
          ? 'Transcribing voice input'
          : isListening
            ? 'Stop voice input'
            : 'Start voice input'
      }
      aria-pressed={isListening}
      className={cn(
        'relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-(--shadow-1) transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none disabled:cursor-wait',
        size === 'sm' ? 'h-10 w-10' : 'h-11 w-11',
        isListening
          ? 'border-(--danger) bg-[color-mix(in_srgb,var(--danger)_12%,var(--surface-elevated))] text-(--danger)'
          : 'border-(--border-subtle) bg-(--surface-elevated) text-(--text-secondary) hover:border-(--brand-500) hover:bg-[color-mix(in_srgb,var(--brand-500)_8%,var(--surface-elevated))] hover:text-(--brand-500)'
      )}
    >
      <span className="relative z-10">
        {phase === 'requesting' || phase === 'transcribing' ? (
          <span
            className="block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden="true"
          />
        ) : isListening ? (
          <StopIcon className="h-4 w-4" />
        ) : (
          <MicIcon className={size === 'sm' ? 'h-4.5 w-4.5' : 'h-5 w-5'} />
        )}
      </span>
    </button>
  );
}

export function VoiceInputStatus({
  phase,
  audioLevel,
  className,
}: {
  phase: VoiceInputPhase;
  audioLevel: number;
  className?: string;
}) {
  if (phase === 'idle') return null;

  const listening = phase === 'listening';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex items-center overflow-hidden rounded-[inherit] border border-(--brand-500)/30 bg-[color-mix(in_srgb,var(--surface-elevated)_94%,var(--brand-500)_6%)] px-3 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {listening ? (
        <>
          <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-(--brand-500)/25" />
          <div
            className="relative grid h-full min-w-0 flex-1 items-center gap-[2px] overflow-hidden"
            style={{ gridTemplateColumns: 'repeat(56, minmax(1px, 1fr))' }}
            aria-hidden="true"
          >
            <span className="voice-flow-sweep absolute inset-y-1 left-0 z-1 w-20" />
            {Array.from({ length: 56 }).map((_, index) => {
              const shape = 0.3 + Math.abs(Math.sin(index * 0.61)) * 0.7;
              const height = 3 + Math.max(0.08, audioLevel) * 25 * shape;
              return (
                <span
                  key={index}
                  className="voice-flow-bar z-2 w-full min-w-px max-w-[3px] justify-self-center rounded-full bg-(--brand-500) transition-[height] duration-75"
                  style={{
                    height,
                    animationDelay: `${(index % 14) * -47}ms`,
                    animationDuration: `${620 + (index % 7) * 38}ms`,
                  }}
                />
              );
            })}
          </div>
          <span className="ml-3 shrink-0 rounded-full bg-(--surface-elevated)/90 px-2 py-1 text-[10px] font-bold text-(--brand-500)">
            Listening
          </span>
        </>
      ) : (
        <div className="flex w-full items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-(--brand-500) border-r-transparent"
            aria-hidden="true"
          />
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-(--brand-500)/15">
            <span className="absolute inset-y-0 w-1/3 animate-[voice-transcribing_1.1s_ease-in-out_infinite] rounded-full bg-(--brand-500)" />
          </div>
          <span className="shrink-0 text-[10px] font-bold text-(--text-secondary)">
            {phase === 'requesting' ? 'Opening microphone…' : 'Turning voice into text…'}
          </span>
        </div>
      )}
    </div>
  );
}
