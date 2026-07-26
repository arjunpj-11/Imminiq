import { useEffect, useMemo, useRef, useState } from 'react';
import { getUserFacingError } from '../../../../../lib/user-facing-error';

import {
  useChatWithLessonTutor,
  useClearLessonChatHistory,
  useLessonChatHistory,
} from '../../hooks/useTrackers';
import type { PersistedLessonChatMessage } from '../../types/tracker.types';

import { DEFAULT_CHAT_GREETING } from '../../constants/lesson-compiler.constants';
import { cn } from '../../utils/tracker-ui';
import MathText from './MathText';
import ConfirmDialog from '../ConfirmDialog';

import { useVoiceInput } from '../../../../../hooks/useVoiceInput';

type LocalLessonChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

import { MicButton, VoiceInputStatus } from '../../../../../components/input/VoiceInputButton';

// ─── Component ───────────────────────────────────────────────────────────────

export default function LessonChatCard({
  lessonTitle,
  trackerId,
  subtopicId,
}: {
  lessonTitle: string;
  trackerId: string;
  subtopicId: string;
}) {
  const chatMutation = useChatWithLessonTutor();
  const clearChatMutation = useClearLessonChatHistory();
  const chatHistoryQuery = useLessonChatHistory(trackerId, subtopicId);

  const sendLockRef = useRef(false);

  const [message, setMessage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalLessonChatMessage[]>([]);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const voice = useVoiceInput((transcript) =>
    setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
  );

  const savedMessages = useMemo<LocalLessonChatMessage[]>(() => {
    return (
      chatHistoryQuery.data?.map((item: PersistedLessonChatMessage) => ({
        role: item.role,
        content: item.content,
      })) ?? []
    );
  }, [chatHistoryQuery.data]);

  const messages = useMemo<LocalLessonChatMessage[]>(() => {
    return [
      { role: 'assistant', content: DEFAULT_CHAT_GREETING },
      ...savedMessages,
      ...localMessages,
    ];
  }, [savedMessages, localMessages]);

  const hasSavedMessages = savedMessages.length > 0;

  const isChatBusy = isSending || chatMutation.isPending || clearChatMutation.isPending;

  useEffect(() => {
    if (!zoomOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomOpen(false);
    };

    window.addEventListener('keydown', handleEscape);

    return () => window.removeEventListener('keydown', handleEscape);
  }, [zoomOpen]);

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed || chatMutation.isPending || sendLockRef.current) {
      return;
    }

    sendLockRef.current = true;
    setIsSending(true);

    const apiMessages = [
      ...savedMessages,
      ...localMessages,
      { role: 'user' as const, content: trimmed },
    ];

    setLocalMessages([{ role: 'user', content: trimmed }]);
    setMessage('');

    chatMutation.mutate(
      {
        trackerId,
        subtopicId,
        messages: apiMessages,
      },
      {
        onSuccess: async () => {
          await chatHistoryQuery.refetch();
          setLocalMessages([]);
        },

        onError: (error) => {
          setLocalMessages([
            {
              role: 'assistant',
              content: getUserFacingError(error, 'I could not answer right now. Please try again.'),
            },
          ]);
        },

        onSettled: () => {
          sendLockRef.current = false;
          setIsSending(false);
        },
      }
    );
  };

  const clearChatHistory = () => {
    if (clearChatMutation.isPending || isSending || !hasSavedMessages) {
      return;
    }

    setClearConfirmOpen(true);
  };

  const confirmClearChatHistory = () => {
    if (clearChatMutation.isPending || isSending || !hasSavedMessages) {
      return;
    }

    clearChatMutation.mutate(
      {
        trackerId,
        subtopicId,
      },
      {
        onSuccess: async () => {
          setLocalMessages([]);
          await chatHistoryQuery.refetch();
          setClearConfirmOpen(false);
        },
      }
    );
  };

  const closeClearConfirm = () => {
    if (clearChatMutation.isPending) return;

    setClearConfirmOpen(false);
  };

  const renderMessages = (large = false) => (
    <div
      className={cn(
        'flex flex-col gap-4 overflow-y-auto pr-1',
        large ? 'max-h-[58vh]' : 'max-h-90'
      )}
    >
      {chatHistoryQuery.isLoading && localMessages.length === 0 && (
        <div className="rounded-2xl border border-(--border-subtle) bg-white/60 px-4 py-3 text-[12px] text-(--text-secondary) dark:border-(--border-subtle) dark:bg-white/5 dark:text-(--text-secondary)">
          Loading previous chat...
        </div>
      )}

      {messages.map((item, index) => {
        const isUser = item.role === 'user';

        return (
          <div
            key={`${item.role}-${index}-${item.content.slice(0, 24)}`}
            className={cn('flex items-end gap-3', isUser && 'flex-row-reverse')}
          >
            {!isUser && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(26,23,20,0.09)] text-[12px] text-(--brand-500) dark:bg-white/9 dark:text-(--brand-500)">
                🤖
              </div>
            )}

            <div
              className={cn(
                'px-4 py-3 leading-normal',
                large ? 'max-w-[78%] text-[14px]' : 'max-w-[85%] text-[13px]',
                isUser
                  ? 'rounded-[16px_16px_4px_16px] border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.08)] text-(--brand-500) dark:border-[rgba(232,129,106,0.22)] dark:bg-[rgba(232,129,106,0.10)] dark:text-(--brand-500)'
                  : 'rounded-[16px_16px_16px_4px] bg-[rgba(26,23,20,0.09)] text-(--text-primary) dark:bg-white/9 dark:text-(--text-primary)'
              )}
            >
              <MathText>{item.content}</MathText>
            </div>
          </div>
        );
      })}

      {isSending && (
        <div className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
          Scribe AI is thinking...
        </div>
      )}

      {clearChatMutation.isPending && (
        <div className="text-[12px] text-red-500 dark:text-red-400">Clearing chat history...</div>
      )}
    </div>
  );

  const renderQuickActions = () => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setMessage('Explain this lesson in simple words')}
        disabled={isChatBusy}
        className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
      >
        Explain simply
      </button>

      <button
        type="button"
        onClick={() => setMessage('Give me a practical example')}
        disabled={isChatBusy}
        className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
      >
        Show examples
      </button>
    </div>
  );

  const renderChatInput = () => (
    <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-(--border-subtle) bg-white px-3 py-1.5 transition focus-within:border-(--brand-500) focus-within:shadow-[0_0_0_3px_rgba(184,76,43,0.18)] dark:border-(--border-subtle) dark:bg-(--surface-elevated)">
      <div className="relative min-w-0 flex-1 self-stretch overflow-hidden rounded-lg">
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();

              if (!isChatBusy) {
                sendMessage();
              }
            }
          }}
          disabled={clearChatMutation.isPending || voice.phase !== 'idle'}
          placeholder="Send a message..."
          className="h-full w-full min-w-0 bg-transparent py-1.5 text-[13px] text-(--text-primary) outline-none placeholder:text-(--text-secondary)/60 disabled:cursor-not-allowed dark:text-(--text-primary) dark:placeholder:text-[#9b9a92]/60"
        />
        <VoiceInputStatus phase={voice.phase} audioLevel={voice.audioLevel} />
      </div>

      <MicButton
        isListening={voice.isListening}
        phase={voice.phase}
        isSupported={voice.isSupported}
        onToggle={voice.toggle}
        size="sm"
      />

      <button
        type="button"
        onClick={sendMessage}
        disabled={isChatBusy}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--brand-500) text-sm text-(--brand-contrast) shadow-(--shadow-1) transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-wait disabled:opacity-50"
      >
        ➤
      </button>
    </div>
  );

  return (
    <>
      <section className="rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) p-5 shadow-(--shadow-1) dark:border-(--border-subtle) dark:bg-(--surface-card)">
        <div className="mb-5 flex items-center justify-between border-b border-(--border-subtle) pb-3.5 dark:border-(--border-subtle)">
          <h3 className="text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
            Ask about {lessonTitle}
          </h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChatHistory}
              disabled={!hasSavedMessages || isChatBusy}
              className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-red-400"
            >
              {clearChatMutation.isPending ? 'Clearing' : 'Clear'}
            </button>

            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) text-[13px] text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
              aria-label="Open chat in large view"
              title="Open large chat"
            >
              ⤢
            </button>

            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          </div>
        </div>

        <div className="mb-5">{renderMessages()}</div>

        <div className="mb-4">{renderQuickActions()}</div>

        {renderChatInput()}
      </section>

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear lesson chat?"
        description="This will permanently remove the saved chat history for this lesson. Your lesson content and progress will not be affected."
        confirmText="Clear chat"
        cancelText="Keep chat"
        variant="danger"
        isLoading={clearChatMutation.isPending}
        onClose={closeClearConfirm}
        onConfirm={confirmClearChatHistory}
      />

      {zoomOpen && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Large lesson chat"
        >
          <div className="relative flex h-[min(760px,92vh)] w-[min(920px,96vw)] flex-col rounded-3xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-(--shadow-3) dark:border-(--border-subtle) dark:bg-(--surface-card)">
            <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle) max-[640px]:px-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-(--brand-500) dark:text-(--brand-500)">
                  Scribe AI Chat
                </div>

                <h3 className="mt-1 line-clamp-1 text-[18px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                  {lessonTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearChatHistory}
                  disabled={!hasSavedMessages || isChatBusy}
                  className="rounded-full border border-(--border-subtle) px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-(--text-secondary) transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-red-400"
                >
                  {clearChatMutation.isPending ? 'Clearing' : 'Clear'}
                </button>

                <button
                  type="button"
                  onClick={() => setZoomOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) text-(--text-secondary) transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.08)] hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary) dark:hover:text-(--brand-500)"
                  aria-label="Close large chat"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-6 py-5 max-[640px]:px-4">
              {renderMessages(true)}
            </div>

            <div className="border-t border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle) max-[640px]:px-4">
              <div className="mb-3">{renderQuickActions()}</div>
              {renderChatInput()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
