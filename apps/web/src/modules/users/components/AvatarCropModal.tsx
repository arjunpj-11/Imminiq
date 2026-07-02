import { useEffect } from 'react'
import type React from 'react'
import { cn } from '../utils/profile-ui.utils'
import { useImageCropControls } from '../hooks/useImageCropControls'

/* ─── Avatar Crop Modal ─── */
interface AvatarCropModalProps {
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
}: AvatarCropModalProps) {
  const {
    imageSrc,
    scale,
    setScale,
    offset,
    dragging,
    previewRef,
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
      <div className="w-[min(620px,100%)] overflow-hidden rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_20px_70px_rgba(0,0,0,0.32)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="flex items-center justify-between border-b border-[#e0d0c5] px-6 py-5 dark:border-white/9">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
              Crop Profile Photo
            </h2>
            <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
              Upload, drag to reposition, and zoom before saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-[#e0d0c5] text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
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
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-white/65 px-6 py-6 text-center transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-[#252320]/55">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-[#b84c2b] dark:text-[#e8816a]"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
              Upload profile image
            </span>
            <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
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
                "relative h-80 w-[320px] touch-none overflow-hidden rounded-full border-[3px] border-[#b84c2b] bg-[#0e0c0a] shadow-[0_14px_34px_rgba(0,0,0,0.20)] dark:border-[#e8816a] max-[420px]:h-65 max-[420px]:w-65",
                dragging && "cursor-grabbing",
              )}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Avatar crop preview"
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                  }}
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
            <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
              Zoom
            </span>
            <input
              type="range"
              min={AVATAR_MIN_ZOOM}
              max={AVATAR_MAX_ZOOM}
              step="0.01"
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="w-full accent-[#b84c2b] dark:accent-[#e8816a]"
            />
            <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#b84c2b] dark:text-[#e8816a]">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-5 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyAvatar}
            className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
