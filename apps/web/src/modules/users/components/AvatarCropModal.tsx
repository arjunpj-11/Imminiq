import { useEffect } from 'react'
import type React from 'react'
import { cn } from '../utils/profile-ui.utils'
import { useImageCropControls } from '../hooks/useImageCropControls'

/* ─── Avatar Crop Modal ─── */
interface IAvatarCropModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

const AVATAR_INITIAL_ZOOM = 0.8;
const AVATAR_MIN_ZOOM = 0.6;
const AVATAR_MAX_ZOOM = 4;

export default function AvatarCropModal({
  open,
  onClose,
  onApply,
  onToast,
}: IAvatarCropModalProps) {
  const {
    imageSrc,
    scale,
    setScale,
    dragging,
    previewRef,
    previewImageStyle,
    setImageSource,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    renderToDataUrl,
  } = useImageCropControls({
    initialScale: AVATAR_INITIAL_ZOOM,
    minScale: AVATAR_MIN_ZOOM,
    maxScale: AVATAR_MAX_ZOOM,
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onToast("File too large — max 5MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setImageSource(result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const applyAvatar = async () => {
    if (!imageSrc || !previewRef.current) {
      onToast("Upload a profile image first");
      return;
    }

    const dataUrl = await renderToDataUrl({ width: 640, height: 640 });
    if (dataUrl) {
      await onApply(dataUrl);
    }
  };

  return (
    <div
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-150 flex items-center justify-center bg-[rgba(26,23,20,0.72)] p-4 backdrop-blur-sm transition",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="w-[min(620px,100%)] overflow-hidden rounded-xl border-[1.5px] border-(--border-subtle) bg-(--surface-card) shadow-[0_20px_70px_rgba(0,0,0,0.32)] dark:border-(--border-subtle) dark:bg-(--surface-card)">
        <div className="flex items-center justify-between border-b border-(--border-subtle) px-6 py-5 dark:border-(--border-subtle)">
          <div>
            <h2 className="font-ui text-[22px] font-extrabold tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)">
              Crop Profile Photo
            </h2>
            <p className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)">
              Upload, drag to reposition, and zoom before saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border-[1.5px] border-(--border-subtle) text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-(--border-subtle) bg-white/65 px-6 py-6 text-center transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-(--surface-elevated)/55">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-(--brand-500) dark:text-(--brand-500)"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-[14px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
              Upload profile image
            </span>
            <span className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
              PNG or JPG, up to 5MB.
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <div className="flex justify-center">
            <div
              ref={previewRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={cn(
                "relative h-80 w-[320px] touch-none overflow-hidden rounded-full border-[3px] border-(--brand-500) bg-[#0e0c0a] shadow-[0_14px_34px_rgba(0,0,0,0.20)] dark:border-(--brand-500) max-[420px]:h-65 max-[420px]:w-65",
                dragging && "cursor-grabbing",
              )}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Avatar crop preview"
                  className="select-none"
                  style={previewImageStyle}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-[13px] font-medium text-white/70">
                  Upload an image to begin
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
              Zoom
            </span>
            <input
              type="range"
              min={AVATAR_MIN_ZOOM}
              max={AVATAR_MAX_ZOOM}
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="w-full accent-(--brand-500) dark:accent-(--brand-500)"
            />
            <span className="w-12 text-right font-mono text-[10px] text-(--brand-500) dark:text-(--brand-500)">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle)">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border-[1.5px] border-(--border-subtle) px-5 py-2.5 text-[13px] font-semibold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyAvatar}
            className="rounded-md bg-(--brand-500) px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
