import {
  Code2,
  File,
  Image,
  LoaderCircle,
  Mic,
  Paperclip,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { cn } from '../../../../lib/cn';
import { isAppReachable } from '../../../../lib/connectivity';
import { safeLocalStorage } from '../../../../lib/storage/safe-storage';
import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { CHAT_MAX_FILE_SIZE } from '../constants/chat.constants';
import { toast } from '../../../../lib/toast';
import { useSendChatMessage } from '../hooks/useChat';
import { useVoiceMessageRecorder } from '../hooks/useVoiceMessageRecorder';
import type { IChatMessage } from '../types/chat.types';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatRecordingTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function SocialComposer({
  conversationId,
  disabled,
  onTyping,
  replyTo,
  onCancelReply,
}: {
  conversationId: string;
  disabled?: boolean;
  onTyping: (isTyping: boolean) => void;
  replyTo?: IChatMessage | null;
  onCancelReply?: () => void;
}) {
  const draftKey = `${STORAGE_KEYS.chatDraftPrefix}:${conversationId}`;
  const queueKey = `${STORAGE_KEYS.chatQueuePrefix}:${conversationId}`;
  const [text, setText] = useState(() => safeLocalStorage.get(draftKey) ?? '');
  const [queuedCount, setQueuedCount] = useState(() => {
    try {
      return (JSON.parse(safeLocalStorage.get(queueKey) ?? '[]') as unknown[]).length;
    } catch {
      return 0;
    }
  });
  const [codeMode, setCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendMessage = useSendChatMessage(conversationId);
  useEffect(() => {
    if (text) safeLocalStorage.set(draftKey, text);
    else safeLocalStorage.remove(draftKey);
  }, [draftKey, text]);

  useEffect(() => {
    const flushQueue = async () => {
      if (!(await isAppReachable())) return;
      let queue: Array<{
        text: string;
        kind: 'text' | 'code';
        codeLanguage?: string;
        replyToMessageId?: string;
      }>;
      try {
        queue = JSON.parse(safeLocalStorage.get(queueKey) ?? '[]') as typeof queue;
      } catch {
        queue = [];
      }
      while (queue.length) {
        try {
          await sendMessage.mutateAsync(queue[0]!);
          queue = queue.slice(1);
          safeLocalStorage.set(queueKey, JSON.stringify(queue));
          setQueuedCount(queue.length);
        } catch {
          break;
        }
      }
    };
    window.addEventListener('online', flushQueue);
    void flushQueue();
    return () => window.removeEventListener('online', flushQueue);
  }, [queueKey, sendMessage]);

  const sendVoiceMessage = useCallback(
    ({ file: recording, durationSeconds }: { file: File; durationSeconds: number }) => {
      sendMessage.mutate(
        {
          text: '',
          kind: 'voice',
          file: recording,
          durationSeconds,
        },
        {
          onError: (mutationError) =>
            toast.error(
              'Voice message not sent',
              mutationError.response?.data?.message ?? 'Voice message could not be sent.'
            ),
        }
      );
    },
    [sendMessage]
  );
  const voice = useVoiceMessageRecorder(sendVoiceMessage);

  useEffect(
    () => () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      onTyping(false);
    },
    [onTyping]
  );

  const updateText = (value: string) => {
    setText(value);
    onTyping(Boolean(value));
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => onTyping(false), 1_200);
  };

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (selected && selected.size > CHAT_MAX_FILE_SIZE) {
      toast.error('Attachment is too large', 'Attachments must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ((!text.trim() && !file) || sendMessage.isPending || isCheckingConnection || disabled) return;

    setIsCheckingConnection(true);
    const reachable = await isAppReachable();
    setIsCheckingConnection(false);

    if (!reachable && !file) {
      let queue: unknown[];
      try {
        queue = JSON.parse(safeLocalStorage.get(queueKey) ?? '[]') as unknown[];
      } catch {
        queue = [];
      }
      queue.push({
        text: text.trim(),
        kind: codeMode ? 'code' : 'text',
        ...(codeMode ? { codeLanguage } : {}),
        ...(replyTo ? { replyToMessageId: replyTo.id } : {}),
      });
      safeLocalStorage.set(queueKey, JSON.stringify(queue));
      setQueuedCount(queue.length);
      setText('');
      safeLocalStorage.remove(draftKey);
      onCancelReply?.();
      toast.info('Message queued', 'It will send automatically when you reconnect.');
      return;
    }
    setUploadProgress(file ? 0 : null);
    sendMessage.mutate(
      {
        text: text.trim(),
        kind: codeMode ? 'code' : 'text',
        ...(codeMode ? { codeLanguage } : {}),
        ...(file ? { file } : {}),
        ...(file ? { onUploadProgress: setUploadProgress } : {}),
        ...(replyTo ? { replyToMessageId: replyTo.id } : {}),
      },
      {
        onSuccess: () => {
          setText('');
          safeLocalStorage.remove(draftKey);
          setFile(null);
          setUploadProgress(null);
          onTyping(false);
          onCancelReply?.();
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (mutationError) => {
          setUploadProgress(null);
          toast.error(
            'Message not sent',
            mutationError.response?.data?.message ?? 'Message could not be sent.'
          );
        },
      }
    );
  };

  if (disabled) {
    return (
      <div className="border-t border-(--border-subtle) bg-(--surface-elevated) px-5 py-4 text-center text-[10px] text-(--text-muted)">
        Unblock this person to send messages or start calls.
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="border-t border-(--border-subtle) bg-(--surface-card)/92 px-3 py-3 shadow-[0_-10px_32px_rgba(26,23,20,0.05)] backdrop-blur sm:px-5 sm:py-4 max-[640px]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      {voice.error && (
        <div className="mb-2 rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-[10px] text-(--danger)">
          {voice.error}
        </div>
      )}
      {queuedCount > 0 && (
        <div
          className="mb-2 rounded-xl border border-(--border-subtle) bg-(--surface-muted) px-3 py-2 text-[10px] text-(--text-secondary)"
          role="status"
        >
          {queuedCount} queued {queuedCount === 1 ? 'message' : 'messages'} waiting for a
          connection.
        </div>
      )}
      {uploadProgress !== null && (
        <div className="mb-2" role="status" aria-label={`Uploading ${uploadProgress}%`}>
          <div className="mb-1 flex justify-between text-[9px] font-semibold text-(--text-muted)">
            <span>Uploading attachment</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-(--surface-muted)">
            <div
              className="h-full rounded-full bg-(--brand-500) transition-[width]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      {replyTo && (
        <div className="mb-2 flex items-center gap-3 rounded-xl border-l-4 border-(--brand-500) bg-(--surface-muted) px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-bold text-(--brand-500)">
              Replying to {replyTo.senderId ? 'a message' : 'your message'}
            </div>
            <div className="truncate text-[10px] text-(--text-secondary)">
              {replyTo.text || `${replyTo.kind} message`}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-(--surface-elevated)"
            aria-label="Cancel reply"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {voice.isRecording ? (
        <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--danger)_35%,var(--border-subtle))] bg-[color-mix(in_srgb,var(--danger)_7%,var(--surface-muted))] px-3">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-(--danger) text-white">
            <Mic size={16} />
            <span className="absolute inset-0 animate-ping rounded-full bg-(--danger)/30" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-(--danger)">Recording voice message</div>
            <div className="mt-0.5 font-mono text-[9px] text-(--text-muted)">
              {formatRecordingTime(voice.durationSeconds)}
            </div>
          </div>
          <button
            type="button"
            onClick={voice.cancel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-(--text-muted) hover:bg-(--surface-elevated) hover:text-(--danger)"
            aria-label="Cancel voice recording"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            onClick={voice.stop}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-(--brand-500) text-(--brand-contrast)"
            aria-label="Stop and send voice recording"
          >
            <Square size={15} fill="currentColor" />
          </button>
        </div>
      ) : (
        <>
          {file && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-muted) px-3 py-2">
              {file.type.startsWith('image/') ? <Image size={14} /> : <File size={14} />}
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{file.name}</span>
              <span className="font-mono text-[8px] text-(--text-muted)">
                {formatFileSize(file.size)}
              </span>
              <button type="button" onClick={() => setFile(null)} aria-label="Remove attachment">
                <X size={14} />
              </button>
            </div>
          )}
          {codeMode && (
            <div className="mb-2 flex items-center gap-2 px-1">
              <Code2 size={13} className="text-(--brand-500)" />
              <span className="text-[10px] font-bold text-(--text-secondary)">Code snippet</span>
              <select
                value={codeLanguage}
                onChange={(event) => setCodeLanguage(event.target.value)}
                className="ml-auto rounded-lg border border-(--border-subtle) bg-(--surface-muted) px-2 py-1 font-mono text-[9px]"
                aria-label="Code language"
              >
                {[
                  'javascript',
                  'typescript',
                  'python',
                  'java',
                  'c',
                  'cpp',
                  'html',
                  'css',
                  'sql',
                  'plain text',
                ].map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end gap-1.5 sm:gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf,.txt,.md,.csv,.zip"
              onChange={chooseFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-(--text-secondary) transition hover:border-(--border-subtle) hover:bg-(--surface-muted) hover:text-(--brand-500)"
              aria-label="Attach a photo or file"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setCodeMode((current) => !current);
                setFile(null);
              }}
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition',
                codeMode
                  ? 'border-[rgba(184,76,43,0.22)] bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)] text-(--brand-500)'
                  : 'border-transparent text-(--text-secondary) hover:border-(--border-subtle) hover:bg-(--surface-muted) hover:text-(--brand-500)'
              )}
              aria-label={codeMode ? 'Switch to a normal message' : 'Send a code snippet'}
              aria-pressed={codeMode}
            >
              <Code2 size={18} />
            </button>
            <div className="flex min-h-11 min-w-0 flex-1 items-end rounded-2xl border border-(--border-subtle) bg-(--surface-elevated) px-3 shadow-inner transition focus-within:border-[color-mix(in_srgb,var(--brand-500)_55%,var(--border-subtle))] focus-within:ring-2 focus-within:ring-[rgba(184,76,43,0.08)]">
              <textarea
                value={text}
                onChange={(event) => updateText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder={codeMode ? 'Paste or type code…' : 'Message'}
                className={cn(
                  'max-h-32 min-h-11 w-full resize-none border-0 bg-transparent py-3 text-[13px] leading-5 outline-none placeholder:text-(--text-muted)',
                  codeMode && 'font-mono'
                )}
                aria-label={codeMode ? 'Code message' : 'Message'}
              />
            </div>
            {text.trim() || file ? (
              <button
                type="submit"
                disabled={sendMessage.isPending || isCheckingConnection}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-500) text-(--brand-contrast) shadow-[0_8px_20px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:opacity-45"
                aria-label="Send message"
              >
                {sendMessage.isPending || isCheckingConnection ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            ) : (
              voice.isSupported && (
                <button
                  type="button"
                  onClick={() => void voice.start()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-500) text-(--brand-contrast) shadow-[0_8px_20px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600)"
                  aria-label="Record voice message"
                >
                  <Mic size={18} />
                </button>
              )
            )}
          </div>
        </>
      )}
    </form>
  );
}
