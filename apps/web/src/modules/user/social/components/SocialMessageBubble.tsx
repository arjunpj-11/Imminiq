import {
  Check,
  CheckCheck,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  File,
  Forward,
  Map,
  Mic,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import Modal from '../../../../components/overlays/Modal';
import { cn } from '../../../../lib/cn';
import { toast } from '../../../../lib/toast';
import { ROUTES } from '../../../../routes/config/route-paths';
import type { IChatMessage } from '../types/chat.types';
import { downloadChatMedia } from '../utils/download-chat-media';
import VoiceMessagePlayer from './VoiceMessagePlayer';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getCopyValue = (message: IChatMessage) =>
  message.kind === 'text' || message.kind === 'code' ? message.text : '';

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

const renderLinkedText = (value: string, mine: boolean) =>
  value.split(URL_PATTERN).map((part, index) => {
    if (!part.match(URL_PATTERN)) return part;
    const href = part.toLowerCase().startsWith('www.') ? `https://${part}` : part;
    return (
      <a
        key={`${part}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'break-all font-semibold underline decoration-1 underline-offset-2',
          mine ? 'text-inherit' : 'text-(--brand-500)'
        )}
      >
        {part}
      </a>
    );
  });

export default function SocialMessageBubble({
  message,
  mine,
  onForward,
  onToggleStar,
  starPending = false,
}: {
  message: IChatMessage;
  mine: boolean;
  onForward: (message: IChatMessage) => void;
  onToggleStar: (message: IChatMessage) => void;
  starPending?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const copyMessage = async () => {
    const value = getCopyValue(message);
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(
        'Copied',
        message.kind === 'code'
          ? 'Code copied to clipboard.'
          : 'Message copied.'
      );
      setMenuOpen(false);
    } catch {
      toast.error('Could not copy', 'Clipboard access is unavailable in this browser.');
    }
  };

  const trackerRoute = message.sharedTracker
    ? message.sharedTracker.visibility === 'private'
      ? ROUTES.trackerRoadmap(message.sharedTracker.trackerId)
      : ROUTES.communityTracker(message.sharedTracker.trackerId)
    : '';
  const isVoiceMessage = Boolean(
    message.attachment &&
      (message.kind === 'voice' ||
        message.attachment.mimeType.startsWith('audio/'))
  );

  const downloadAttachment = async () => {
    if (!message.attachment || downloadPending) return;
    setDownloadPending(true);
    try {
      await downloadChatMedia(
        message.attachment.url,
        message.attachment.name
      );
      toast.success('Download started', message.attachment.name);
      setMenuOpen(false);
    } catch {
      toast.error(
        'Could not download',
        'The media could not be downloaded. Please try again.'
      );
    } finally {
      setDownloadPending(false);
    }
  };

  return (
    <>
      <div className={cn('flex w-full', mine ? 'justify-end' : 'justify-start')}>
      <article
        className={cn(
          'group relative max-w-[90%] rounded-[20px] px-4 py-3 shadow-[0_6px_20px_rgba(23,20,18,0.07)] sm:max-w-[74%]',
          mine
            ? 'rounded-br-md bg-[linear-gradient(145deg,var(--brand-500),color-mix(in_srgb,var(--brand-500)_86%,#713621))] text-white shadow-[0_8px_24px_rgba(184,76,43,0.16)] dark:text-[#17120f]'
            : 'rounded-bl-md border border-(--border-subtle) bg-(--surface-elevated)/96 text-(--text-primary)'
        )}
      >
        <div ref={menuRef} className="absolute right-1.5 top-1.5 z-4">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full opacity-70 backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100',
              mine ? 'bg-black/15 text-white dark:text-black' : 'bg-(--surface-muted)'
            )}
            aria-label="Message actions"
            aria-expanded={menuOpen}
          >
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-7 w-40 rounded-xl border border-(--border-subtle) bg-(--surface-elevated) p-1.5 text-(--text-primary) shadow-(--shadow-3)"
            >
              {getCopyValue(message) && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void copyMessage()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-semibold hover:bg-(--surface-muted)"
                >
                  <Copy size={13} />
                  Copy
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                disabled={starPending}
                onClick={() => {
                  setMenuOpen(false);
                  onToggleStar(message);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-semibold hover:bg-(--surface-muted) disabled:opacity-50"
              >
                <Star
                  size={13}
                  fill={message.isStarred ? 'currentColor' : 'none'}
                  className={message.isStarred ? 'text-(--warning)' : undefined}
                />
                {message.isStarred ? 'Remove star' : 'Star message'}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onForward(message);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-semibold hover:bg-(--surface-muted)"
              >
                <Forward size={13} />
                Forward
              </button>
              {message.attachment &&
                message.kind === 'image' && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void downloadAttachment()}
                    disabled={downloadPending}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-semibold hover:bg-(--surface-muted) disabled:opacity-50"
                  >
                    <Download size={13} />
                    {downloadPending ? 'Downloading…' : 'Download'}
                  </button>
                )}
            </div>
          )}
        </div>

        {message.isForwarded && (
          <div className={cn('mb-1.5 flex items-center gap-1 text-[8px] italic', mine ? 'opacity-70' : 'text-(--text-muted)')}>
            <Forward size={10} />
            Forwarded
          </div>
        )}

        {message.kind === 'image' && message.attachment && (
          <button
            type="button"
            onClick={() => setImagePreviewOpen(true)}
            className="mb-2 block overflow-hidden rounded-xl text-left"
            aria-label={`Open ${message.attachment.name}`}
          >
            <img
              src={message.attachment.url}
              alt={message.text || message.attachment.name}
              className="max-h-80 w-full object-cover"
              loading="lazy"
            />
          </button>
        )}

        {message.kind === 'file' && message.attachment && !isVoiceMessage && (
          <button
            type="button"
            onClick={() => void downloadAttachment()}
            disabled={downloadPending}
            className={cn(
              'mb-1 flex min-w-[230px] items-center gap-3 rounded-xl border p-3 text-left',
              mine
                ? 'border-white/25 bg-black/10 text-inherit'
                : 'border-(--border-subtle) bg-(--surface-muted) text-(--text-primary)'
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <File size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold">
                {message.attachment.name}
              </span>
              <span className="mt-0.5 block font-mono text-[8px] opacity-70">
                {formatFileSize(message.attachment.sizeBytes)}
              </span>
            </span>
            <Download size={15} className={downloadPending ? 'animate-pulse' : ''} />
          </button>
        )}

        {isVoiceMessage && message.attachment && (
          <div className="min-w-[250px] pr-6">
            <div className="mb-1 flex items-center gap-2 text-[9px] font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Mic size={13} />
              </span>
              <span className="flex-1 opacity-75">
                Voice message
              </span>
            </div>
            <VoiceMessagePlayer attachment={message.attachment} mine={mine} />
          </div>
        )}

        {message.kind === 'tracker' && message.sharedTracker && (
          <Link
            to={trackerRoute}
            className={cn(
              'mb-1 block min-w-[250px] rounded-xl border p-3 no-underline',
              mine
                ? 'border-white/25 bg-black/10 text-inherit'
                : 'border-(--border-subtle) bg-(--surface-muted) text-(--text-primary)'
            )}
          >
            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em] opacity-65">
              <Map size={13} />
              Shared tracker
            </div>
            <div className="mt-2 text-[12px] font-bold">
              {message.sharedTracker.title}
            </div>
            {message.sharedTracker.description && (
              <div className="mt-1 line-clamp-2 text-[9px] leading-relaxed opacity-75">
                {message.sharedTracker.description}
              </div>
            )}
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold">
              Open tracker <ExternalLink size={11} />
            </div>
          </Link>
        )}

        {message.kind === 'profile' && message.sharedProfile && (
          <Link
            to={ROUTES.publicProfileFor(message.sharedProfile.username)}
            className={cn(
              'mb-1 block min-w-[260px] rounded-2xl border p-3.5 no-underline transition hover:-translate-y-0.5',
              mine
                ? 'border-white/25 bg-black/10 text-inherit hover:bg-black/15'
                : 'border-(--border-subtle) bg-(--surface-muted) text-(--text-primary) hover:border-(--brand-500)'
            )}
            aria-label={`Open ${message.sharedProfile.fullName}'s profile`}
          >
            <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em] opacity-65">
              <UserRound size={13} />
              Shared profile
            </div>
            <div className="mt-3 flex items-center gap-3">
              {message.sharedProfile.avatarUrl ? (
                <img
                  src={message.sharedProfile.avatarUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-[13px] font-extrabold">
                  {message.sharedProfile.fullName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-extrabold">
                  {message.sharedProfile.fullName}
                </span>
                <span className="mt-0.5 block truncate text-[9px] opacity-70">
                  @{message.sharedProfile.username}
                </span>
              </span>
            </div>
            {message.sharedProfile.headline && (
              <div className="mt-2 line-clamp-2 text-[9px] leading-relaxed opacity-75">
                {message.sharedProfile.headline}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 text-[9px] font-bold">
              View profile <ExternalLink size={11} />
            </div>
          </Link>
        )}

        {message.kind === 'code' ? (
          <div className="min-w-[240px] overflow-hidden rounded-xl bg-[#171614] text-[#f4eee8]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.1em] text-white/55">
              <span className="flex items-center gap-1.5">
                <Code2 size={12} />
                {message.codeLanguage ?? 'plain text'}
              </span>
              <button
                type="button"
                onClick={() => void copyMessage()}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <Copy size={11} />
                Copy
              </button>
            </div>
            <pre className="m-0 max-h-80 overflow-auto whitespace-pre-wrap p-3 font-mono text-[10px] leading-relaxed">
              <code>{message.text}</code>
            </pre>
          </div>
        ) : (
          message.text && (
            <p className="m-0 whitespace-pre-wrap break-words pr-4 text-[13px] leading-[1.6]">
              {renderLinkedText(message.text, mine)}
            </p>
          )
        )}

        <div
          className={cn(
            'mt-1.5 flex items-center justify-end gap-1 font-mono text-[9px]',
            mine ? 'text-white/70 dark:text-black/55' : 'text-(--text-muted)'
          )}
        >
          {message.isStarred && (
            <Star
              size={11}
              fill="currentColor"
              className={mine ? 'text-amber-200 dark:text-amber-700' : 'text-(--warning)'}
              aria-label="Starred message"
            />
          )}
          <time>{formatMessageTime(message.createdAt)}</time>
          {mine &&
            (message.isRead ? (
              <CheckCheck size={12} aria-label="Read" />
            ) : (
              <Check size={12} aria-label="Sent" />
            ))}
        </div>
      </article>
      </div>

      {message.attachment && (
        <Modal
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          ariaLabel={`Preview ${message.attachment.name}`}
          overlayClassName="z-200 bg-black/85 p-3 sm:p-8"
          contentClassName="flex h-full max-w-none items-center justify-center overflow-visible border-0 bg-transparent p-0 shadow-none"
        >
          <button
            type="button"
            onClick={() => setImagePreviewOpen(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/75"
            aria-label="Close image preview"
          >
            <X size={19} />
          </button>
          <img
            src={message.attachment.url}
            alt={message.text || message.attachment.name}
            className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => void downloadAttachment()}
            disabled={downloadPending}
            className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-5 py-3 text-[10px] font-bold text-black shadow-xl disabled:opacity-60"
          >
            <Download size={15} />
            {downloadPending ? 'Downloading…' : 'Download image'}
          </button>
        </Modal>
      )}
    </>
  );
}
