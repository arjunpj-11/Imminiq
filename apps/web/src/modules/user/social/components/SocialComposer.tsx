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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import { cn } from '../../../../lib/cn';
import { CHAT_MAX_FILE_SIZE } from '../constants/chat.constants';
import { useSendChatMessage } from '../hooks/useChat';
import { useVoiceMessageRecorder } from '../hooks/useVoiceMessageRecorder';

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
}: {
  conversationId: string;
  disabled?: boolean;
  onTyping: (isTyping: boolean) => void;
}) {
  const [text, setText] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendMessage = useSendChatMessage(conversationId);

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
            setError(
              mutationError.response?.data?.message ??
                'Voice message could not be sent.'
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
    setError(undefined);
    if (selected && selected.size > CHAT_MAX_FILE_SIZE) {
      setError('Attachments must be 10 MB or smaller.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if ((!text.trim() && !file) || sendMessage.isPending || disabled) return;
    setError(undefined);
    sendMessage.mutate(
      {
        text: text.trim(),
        kind: codeMode ? 'code' : 'text',
        ...(codeMode ? { codeLanguage } : {}),
        ...(file ? { file } : {}),
      },
      {
        onSuccess: () => {
          setText('');
          setFile(null);
          onTyping(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (mutationError) =>
          setError(
            mutationError.response?.data?.message ?? 'Message could not be sent.'
          ),
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
      onSubmit={submit}
      className="border-t border-(--border-subtle) bg-(--surface-card)/92 px-3 py-3 shadow-[0_-10px_32px_rgba(26,23,20,0.05)] backdrop-blur sm:px-5 sm:py-4 max-[640px]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      {(error || voice.error) && (
        <div className="mb-2 rounded-xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3 py-2 text-[10px] text-(--danger)">
          {error ?? voice.error}
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
              <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">
                {file.name}
              </span>
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
              <span className="text-[10px] font-bold text-(--text-secondary)">
                Code snippet
              </span>
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
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.md,.csv,.zip"
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
                disabled={sendMessage.isPending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--brand-500) text-(--brand-contrast) shadow-[0_8px_20px_rgba(184,76,43,0.18)] transition hover:-translate-y-0.5 hover:bg-(--brand-600) disabled:opacity-45"
                aria-label="Send message"
              >
                {sendMessage.isPending ? (
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
