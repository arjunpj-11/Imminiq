import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { useGenerateAiBannerPreview } from '../hooks/useGenerateAiBannerPreview'
import { cn, themedScrollbar } from '../utils/profile-ui.utils'
import { bannerDataUrlToPng, loadImage, svgBannerDataUrl } from '../utils/profile-image.utils'

/* ─── Cover Banner Modal ─── */
interface BannerModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

type BannerTab = "defaults" | "upload" | "ai";

const bannerPresets = [
  {
    name: "Scholar Rust",
    palette: "from-[#0e0c0a] via-[#6f2d1b] to-[#b84c2b]",
    dataUrl: svgBannerDataUrl("#0e0c0a", "#6f2d1b", "#b84c2b"),
  },
  {
    name: "Midnight Blue",
    palette: "from-[#07111f] via-[#17315c] to-[#3b6cb7]",
    dataUrl: svgBannerDataUrl("#07111f", "#17315c", "#3b6cb7"),
  },
  {
    name: "Forest Mentor",
    palette: "from-[#07150f] via-[#16452e] to-[#4caf7d]",
    dataUrl: svgBannerDataUrl("#07150f", "#16452e", "#4caf7d"),
  },
  {
    name: "Amber Prestige",
    palette: "from-[#171005] via-[#634200] to-[#c98000]",
    dataUrl: svgBannerDataUrl("#171005", "#634200", "#c98000"),
  },
];

const defaultCustomBannerColors = {
  start: "#120d0b",
  mid: "#8c3f29",
  end: "#e8816a",
};

export default function BannerModal({ open, onClose, onApply, onToast }: BannerModalProps) {
  const generateAiBannerPreviewMutation = useGenerateAiBannerPreview();
  const [tab, setTab] = useState<BannerTab>("defaults");
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeImageSource, setActiveImageSource] = useState<
    "upload" | "ai" | null
  >(null);
  const [selectedPreset, setSelectedPreset] = useState(
    bannerPresets[0].dataUrl,
  );
  const [customSelected, setCustomSelected] = useState(false);
  const [customBannerColors, setCustomBannerColors] = useState(
    defaultCustomBannerColors,
  );
  const customBannerDataUrl = useMemo(
    () =>
      svgBannerDataUrl(
        customBannerColors.start,
        customBannerColors.mid,
        customBannerColors.end,
      ),
    [customBannerColors],
  );
  const selectedBannerDataUrl = customSelected
    ? customBannerDataUrl
    : selectedPreset;
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

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
    if (file.size > 8 * 1024 * 1024) {
      onToast("File too large — max 8MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      setImageSrc(result);
      setActiveImageSource("upload");
      setOffset({ x: 0, y: 0 });
      setScale(1);
      setCustomSelected(false);
      setTab("upload");
      const img = new Image();
      img.src = result;
      img.onload = () => {
        imageRef.current = img;
      };
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleGenerateAiBanner = async () => {
    const cleanedPrompt = aiPrompt.trim();

    if (cleanedPrompt.length < 5) {
      onToast("Write at least 5 characters for the banner prompt.");
      return;
    }

    try {
      const response = await generateAiBannerPreviewMutation.mutateAsync({
        prompt: cleanedPrompt,
      });

      const generatedImageUrl = response.data?.imageUrl;

      if (!generatedImageUrl) {
        onToast("AI banner generation returned no image. Please try again.");
        return;
      }

      setImageSrc(generatedImageUrl);
      setActiveImageSource("ai");
      setOffset({ x: 0, y: 0 });
      setScale(1);
      setCustomSelected(false);

      const image = new Image();
      image.src = generatedImageUrl;
      image.onload = () => {
        imageRef.current = image;
      };

      onToast("AI banner generated. Adjust the crop and apply it.");
    } catch {
      onToast("Unable to generate AI banner. Please try again.");
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    setDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      ox: offset.x,
      oy: offset.y,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.ox + (event.clientX - dragStart.x),
      y: dragStart.oy + (event.clientY - dragStart.y),
    });
  };

  const handlePointerUp = () => setDragging(false);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    event.preventDefault();
    setScale((current) =>
      Math.min(
        4,
        Math.max(
          1,
          Number((current + (event.deltaY < 0 ? 0.08 : -0.08)).toFixed(2)),
        ),
      ),
    );
  };

  const applyUploadedBanner = async () => {
    if (!imageSrc || !previewRef.current) {
      onToast(
        tab === "ai"
          ? "Generate an AI banner first"
          : "Upload a banner image first",
      );
      return;
    }

    const image = imageRef.current ?? (await loadImage(imageSrc));
    const width = 1600;
    const height = 400;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const preview = previewRef.current.getBoundingClientRect();
    const fitScale = Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight,
    );
    const renderScale = fitScale * scale;
    const drawWidth = image.naturalWidth * renderScale;
    const drawHeight = image.naturalHeight * renderScale;
    const ratioX = width / Math.max(preview.width, 1);
    const ratioY = height / Math.max(preview.height, 1);
    const drawX = (width - drawWidth) / 2 + offset.x * ratioX;
    const drawY = (height - drawHeight) / 2 + offset.y * ratioY;

    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    await onApply(canvas.toDataURL("image/png"));
  };

  return (
    <div
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-140 flex items-center justify-center bg-[rgba(26,23,20,0.72)] p-4 backdrop-blur-sm transition",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="w-[min(860px,100%)] overflow-hidden rounded-[22px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] shadow-[0_20px_70px_rgba(0,0,0,0.32)] dark:border-white/9 dark:bg-[#1e1c19]">
        <div className="flex items-center justify-between border-b border-[#e0d0c5] px-6 py-5 dark:border-white/9">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-[22px] font-extrabold tracking-[-0.4px] text-[#1a1714] dark:text-[#f2f0eb]">
              Change Cover Banner
            </h2>
            <p className="mt-1 text-[12.5px] text-[#6b5f58] dark:text-[#9b9a92]">
              Choose a template, upload your own image, or preview an AI option.
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

        <div className="border-b border-[#e0d0c5] px-6 pt-4 dark:border-white/9">
          <div className="flex flex-wrap gap-2">
            {(["defaults", "upload", "ai"] as BannerTab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "rounded-t-[10px] border border-b-0 px-4 py-2.5 text-[12px] font-semibold capitalize transition",
                  tab === item
                    ? "border-[#e0d0c5] bg-[#f5ede4] text-[#b84c2b] dark:border-white/9 dark:bg-[#252320] dark:text-[#e8816a]"
                    : "border-transparent text-[#6b5f58] hover:text-[#b84c2b] dark:text-[#9b9a92]",
                )}
              >
                {item === "ai" ? "AI Generate" : item}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn("max-h-[70vh] overflow-y-auto p-6", themedScrollbar)}
        >
          {tab === "defaults" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
                {bannerPresets.map((preset) => {
                  const active =
                    !customSelected && selectedPreset === preset.dataUrl;

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setCustomSelected(false);
                        setSelectedPreset(preset.dataUrl);
                      }}
                      className={cn(
                        "overflow-hidden rounded-2xl border-2 text-left transition",
                        active
                          ? "border-[#b84c2b] shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-[#e8816a]"
                          : "border-[#e0d0c5] hover:border-[#e8816a] dark:border-white/9",
                      )}
                    >
                      <div
                        className={cn(
                          "aspect-4/1 bg-linear-to-br",
                          preset.palette,
                        )}
                      />
                      <div className="flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                        {preset.name}
                        {active && (
                          <span className="rounded-full bg-[#b84c2b] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-white/70 p-4 dark:border-white/9 dark:bg-[#252320]/70">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.18em] text-[#6b5f58] opacity-60 dark:text-[#9b9a92]">
                      Custom Banner
                    </div>
                    <div className="mt-1 text-[14px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                      Build your own gradient
                    </div>
                  </div>

                  {customSelected && (
                    <span className="rounded-full bg-[#b84c2b] px-2.5 py-1 text-[10px] font-bold text-white dark:bg-[#e8816a] dark:text-[#141412]">
                      Selected
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCustomSelected(true)}
                  className={cn(
                    "relative mb-4 block w-full overflow-hidden rounded-2xl border-2 transition",
                    customSelected
                      ? "border-[#b84c2b] shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-[#e8816a]"
                      : "border-[#e0d0c5] hover:border-[#e8816a] dark:border-white/9",
                  )}
                >
                  <img
                    src={customBannerDataUrl}
                    alt="Custom banner preview"
                    className="aspect-4/1 h-auto w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.16),rgba(255,255,255,0.02))]" />
                </button>

                <div className="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
                  {[
                    {
                      key: "start",
                      label: "Start",
                    },
                    {
                      key: "mid",
                      label: "Middle",
                    },
                    {
                      key: "end",
                      label: "End",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex flex-col gap-2 rounded-xl border border-[#e0d0c5] bg-[#fdf8f5] p-3 dark:border-white/9 dark:bg-[#1e1c19]"
                    >
                      <span className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                        {item.label} Color
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            customBannerColors[
                              item.key as keyof typeof customBannerColors
                            ]
                          }
                          onChange={(event) => {
                            setCustomBannerColors((current) => ({
                              ...current,
                              [item.key]: event.target.value,
                            }));
                            setCustomSelected(true);
                          }}
                          className="h-9 w-12 cursor-pointer rounded-lg border border-[#e0d0c5] bg-transparent p-1 dark:border-white/9"
                        />

                        <span className="truncate font-['DM_Mono',monospace] text-[10px] uppercase tracking-[0.06em] text-[#6b5f58] dark:text-[#9b9a92]">
                          {
                            customBannerColors[
                              item.key as keyof typeof customBannerColors
                            ]
                          }
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "upload" && (
            <div className="flex flex-col gap-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-white/65 px-6 py-8 text-center transition hover:border-[#e8816a] hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-[#252320]/55">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#b84c2b] dark:text-[#e8816a]"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[14px] font-semibold text-[#1a1714] dark:text-[#f2f0eb]">
                  Upload a cover image
                </span>
                <span className="text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">
                  PNG or JPG, up to 8MB. Drag inside the crop frame and scroll
                  to zoom.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              {imageSrc && (
                <>
                  <div
                    ref={previewRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={handleWheel}
                    className={cn(
                      "relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-[#b84c2b] bg-[#0e0c0a] dark:border-[#e8816a]",
                      dragging && "cursor-grabbing",
                    )}
                  >
                    <img
                      src={imageSrc}
                      alt="Banner crop preview"
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-white/20" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Zoom
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.01"
                      value={scale}
                      onChange={(event) => setScale(Number(event.target.value))}
                      className="w-full accent-[#b84c2b] dark:accent-[#e8816a]"
                    />
                    <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#b84c2b] dark:text-[#e8816a]">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "ai" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-[18px] border-[1.5px] border-[rgba(99,65,168,0.24)] bg-[linear-gradient(135deg,rgba(99,65,168,0.12),rgba(59,108,183,0.10))] p-5">
                <div className="mb-2 flex items-center gap-2 text-[15px] font-bold text-[#1a1714] dark:text-[#f2f0eb]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#6b9fe8]"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate a custom AI cover banner
                </div>

                <p className="mb-4 text-[13px] leading-[1.6] text-[#6b5f58] dark:text-[#9b9a92]">
                  Describe the banner mood, scene, or theme. Imminiq will generate
                  a preview, then you can drag and zoom it before applying.
                </p>

                <label className="mb-3 block">
                  <span className="mb-2 block font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.16em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                    Banner Prompt
                  </span>
                  <textarea
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    placeholder="A premium dark developer workspace with subtle neon green lighting, elegant depth, cinematic composition..."
                    rows={4}
                    maxLength={500}
                    className="min-h-26 w-full resize-y rounded-xl border-[1.5px] border-[rgba(99,65,168,0.26)] bg-white/85 px-3.5 py-3 text-[13px] leading-[1.6] text-[#1a1714] outline-none transition placeholder:text-[#9f8f86] focus:border-[#6341a8] focus:shadow-[0_0_0_3px_rgba(99,65,168,0.14)] dark:bg-[#252320]/85 dark:text-[#f2f0eb] dark:placeholder:text-[#7a756e]"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
                    {aiPrompt.trim().length}/500 characters
                  </span>

                  <button
                    type="button"
                    onClick={handleGenerateAiBanner}
                    disabled={generateAiBannerPreviewMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#6341a8,#3b6cb7)] px-4 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  >
                    {generateAiBannerPreviewMutation.isPending ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                        Generating...
                      </>
                    ) : (
                      "Generate Banner"
                    )}
                  </button>
                </div>
              </div>

              {activeImageSource === "ai" && imageSrc && (
                <>
                  <div
                    ref={previewRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={handleWheel}
                    className={cn(
                      "relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-[#6341a8] bg-[#0e0c0a] dark:border-[#6b9fe8]",
                      dragging && "cursor-grabbing",
                    )}
                  >
                    <img
                      src={imageSrc}
                      alt="AI banner crop preview"
                      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: "center center",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 border border-white/20" />
                    <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                      AI preview · drag to reposition
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.12em] text-[#6b5f58] dark:text-[#9b9a92]">
                      Zoom
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.01"
                      value={scale}
                      onChange={(event) => setScale(Number(event.target.value))}
                      className="w-full accent-[#6341a8] dark:accent-[#6b9fe8]"
                    />
                    <span className="w-12 text-right font-['DM_Mono',monospace] text-[10px] text-[#6341a8] dark:text-[#6b9fe8]">
                      {Math.round(scale * 100)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e0d0c5] px-6 py-4 dark:border-white/9">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border-[1.5px] border-[#e0d0c5] px-5 py-2.5 text-[13px] font-semibold text-[#6b5f58] transition hover:border-[#e8816a] hover:text-[#b84c2b] dark:border-white/9 dark:text-[#9b9a92]"
          >
            Cancel
          </button>
          {tab === "defaults" ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const pngBannerDataUrl =
                    await bannerDataUrlToPng(selectedBannerDataUrl);

                  await onApply(pngBannerDataUrl);
                } catch {
                  onToast("Unable to prepare this banner. Please try again.");
                }
              }}
              className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              Apply Selected
            </button>
          ) : tab === "upload" ? (
            <button
              type="button"
              onClick={applyUploadedBanner}
              disabled={activeImageSource !== "upload" || !imageSrc}
              className="rounded-[10px] bg-[#b84c2b] px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-[#963d22] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-[#e8816a] dark:text-[#141412] dark:hover:bg-[#d4705a]"
            >
              {activeImageSource === "upload" && imageSrc
                ? "Apply Banner"
                : "Upload First"}
            </button>
          ) : (
            <button
              type="button"
              onClick={applyUploadedBanner}
              disabled={activeImageSource !== "ai" || !imageSrc}
              className="rounded-[10px] bg-[#6341a8] px-5.5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#543591] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-[#6b9fe8] dark:text-[#141412] dark:hover:bg-[#5c8fd7]"
            >
              {activeImageSource === "ai" && imageSrc
                ? "Apply AI Banner"
                : "Generate First"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
