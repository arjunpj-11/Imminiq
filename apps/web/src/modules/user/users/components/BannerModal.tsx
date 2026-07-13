import { useMemo, useState } from 'react';
import type React from 'react';
import Modal from '../../../../components/overlays/Modal';
import { useGenerateAiBannerPreview } from '../hooks/mutations/useGenerateAiBannerPreview';
import { cn, themedScrollbar } from '../utils/profile-ui.utils';
import { bannerDataUrlToPng, svgBannerDataUrl } from '../utils/profile-image.utils';
import { useImageCropControls } from '../hooks/ui/useImageCropControls';

/* ─── Cover Banner Modal ─── */
interface IBannerModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (dataUrl: string) => void | Promise<void>;
  onToast: (message: string) => void;
}

type BannerTab = 'defaults' | 'upload' | 'ai';

const bannerPresets = [
  {
    name: 'Scholar Rust',
    palette: 'from-[#0e0c0a] via-[#6f2d1b] to-[var(--brand-500)]',
    dataUrl: svgBannerDataUrl('#0e0c0a', '#6f2d1b', 'var(--brand-500)'),
  },
  {
    name: 'Midnight Blue',
    palette: 'from-[#07111f] via-[#17315c] to-[var(--info)]',
    dataUrl: svgBannerDataUrl('#07111f', '#17315c', 'var(--info)'),
  },
  {
    name: 'Forest Mentor',
    palette: 'from-[#07150f] via-[#16452e] to-[var(--success)]',
    dataUrl: svgBannerDataUrl('#07150f', '#16452e', 'var(--success)'),
  },
  {
    name: 'Amber Prestige',
    palette: 'from-[#171005] via-[#634200] to-[var(--warning)]',
    dataUrl: svgBannerDataUrl('#171005', '#634200', 'var(--warning)'),
  },
];

const defaultCustomBannerColors = {
  start: '#120d0b',
  mid: '#8c3f29',
  end: 'var(--brand-500)',
};

export default function BannerModal({ open, onClose, onApply, onToast }: IBannerModalProps) {
  const generateAiBannerPreviewMutation = useGenerateAiBannerPreview();
  const [tab, setTab] = useState<BannerTab>('defaults');
  const [aiPrompt, setAiPrompt] = useState('');
  const [activeImageSource, setActiveImageSource] = useState<'upload' | 'ai' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(bannerPresets[0].dataUrl);
  const [customSelected, setCustomSelected] = useState(false);
  const [customBannerColors, setCustomBannerColors] = useState(defaultCustomBannerColors);
  const customBannerDataUrl = useMemo(
    () =>
      svgBannerDataUrl(customBannerColors.start, customBannerColors.mid, customBannerColors.end),
    [customBannerColors]
  );
  const selectedBannerDataUrl = customSelected ? customBannerDataUrl : selectedPreset;
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
    initialScale: 1,
    minScale: 1,
    maxScale: 4,
  });

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      onToast('File too large — max 8MB');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) return;
      setImageSource(result);
      setActiveImageSource('upload');
      setCustomSelected(false);
      setTab('upload');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleGenerateAiBanner = async () => {
    const cleanedPrompt = aiPrompt.trim();

    if (cleanedPrompt.length < 5) {
      onToast('Write at least 5 characters for the banner prompt.');
      return;
    }

    try {
      const response = await generateAiBannerPreviewMutation.mutateAsync({
        prompt: cleanedPrompt,
      });

      const generatedImageUrl = response.data?.imageUrl;

      if (!generatedImageUrl) {
        onToast('AI banner generation returned no image. Please try again.');
        return;
      }

      setImageSource(generatedImageUrl);
      setActiveImageSource('ai');
      setCustomSelected(false);

      onToast('AI banner generated. Adjust the crop and apply it.');
    } catch {
      onToast('Unable to generate AI banner. Please try again.');
    }
  };

  const applyUploadedBanner = async () => {
    if (!imageSrc || !previewRef.current) {
      onToast(tab === 'ai' ? 'Generate an AI banner first' : 'Upload a banner image first');
      return;
    }

    const dataUrl = await renderToDataUrl({ width: 1600, height: 400 });
    if (dataUrl) {
      await onApply(dataUrl);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="banner-modal-title"
      descriptionId="banner-modal-description"
      ariaLabel="Change cover banner"
      overlayClassName="overflow-y-auto py-4"
      contentClassName="flex max-h-[calc(100dvh-2rem)] w-full !max-w-[1100px] flex-col overflow-hidden p-0"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-(--border-subtle) px-6 py-5 dark:border-(--border-subtle)">
        <div>
          <h2
            id="banner-modal-title"
            className="font-ui text-[22px] font-extrabold tracking-[-0.4px] text-(--text-primary) dark:text-(--text-primary)"
          >
            Change Cover Banner
          </h2>
          <p
            id="banner-modal-description"
            className="mt-1 text-[12.5px] text-(--text-secondary) dark:text-(--text-secondary)"
          >
            Choose a template, upload your own image, or preview an AI option.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close banner editor"
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

      <div className="shrink-0 border-b border-(--border-subtle) px-6 pt-4 dark:border-(--border-subtle)">
        <div className="flex flex-wrap gap-2">
          {(['defaults', 'upload', 'ai'] as BannerTab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                'rounded-t-[10px] border border-b-0 px-4 py-2.5 text-[12px] font-semibold capitalize transition',
                tab === item
                  ? 'border-(--border-subtle) bg-(--surface-canvas) text-(--brand-500) dark:border-(--border-subtle) dark:bg-(--surface-elevated) dark:text-(--brand-500)'
                  : 'border-transparent text-(--text-secondary) hover:text-(--brand-500) dark:text-(--text-secondary)'
              )}
            >
              {item === 'ai' ? 'AI Generate' : item}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-y-auto p-6', themedScrollbar)}>
        {tab === 'defaults' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
              {bannerPresets.map((preset) => {
                const active = !customSelected && selectedPreset === preset.dataUrl;

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setCustomSelected(false);
                      setSelectedPreset(preset.dataUrl);
                    }}
                    className={cn(
                      'overflow-hidden rounded-2xl border-2 text-left transition',
                      active
                        ? 'border-(--brand-500) shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-(--brand-500)'
                        : 'border-(--border-subtle) hover:border-(--brand-500) dark:border-(--border-subtle)'
                    )}
                  >
                    <div className={cn('aspect-4/1 bg-linear-to-br', preset.palette)} />
                    <div className="flex items-center justify-between px-3.5 py-3 text-[13px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                      {preset.name}
                      {active && (
                        <span className="rounded-full bg-(--brand-500) px-2 py-0.5 text-[10px] font-bold text-white dark:bg-(--brand-500) dark:text-[#141412]">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border-[1.5px] border-(--border-subtle) bg-white/70 p-4 dark:border-(--border-subtle) dark:bg-(--surface-elevated)/70">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-(--text-secondary) opacity-60 dark:text-(--text-secondary)">
                    Custom Banner
                  </div>
                  <div className="mt-1 text-[14px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                    Build your own gradient
                  </div>
                </div>

                {customSelected && (
                  <span className="rounded-full bg-(--brand-500) px-2.5 py-1 text-[10px] font-bold text-white dark:bg-(--brand-500) dark:text-[#141412]">
                    Selected
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setCustomSelected(true)}
                className={cn(
                  'relative mb-4 block w-full overflow-hidden rounded-2xl border-2 transition',
                  customSelected
                    ? 'border-(--brand-500) shadow-[0_0_0_4px_rgba(184,76,43,0.14)] dark:border-(--brand-500)'
                    : 'border-(--border-subtle) hover:border-(--brand-500) dark:border-(--border-subtle)'
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
                    key: 'start',
                    label: 'Start',
                  },
                  {
                    key: 'mid',
                    label: 'Middle',
                  },
                  {
                    key: 'end',
                    label: 'End',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex flex-col gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-card) p-3 dark:border-(--border-subtle) dark:bg-(--surface-card)"
                  >
                    <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                      {item.label} Color
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBannerColors[item.key as keyof typeof customBannerColors]}
                        onChange={(event) => {
                          setCustomBannerColors((current) => ({
                            ...current,
                            [item.key]: event.target.value,
                          }));
                          setCustomSelected(true);
                        }}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-(--border-subtle) bg-transparent p-1 dark:border-(--border-subtle)"
                      />

                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.06em] text-(--text-secondary) dark:text-(--text-secondary)">
                        {customBannerColors[item.key as keyof typeof customBannerColors]}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'upload' && (
          <div className="flex flex-col gap-5">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-(--border-subtle) bg-white/65 px-6 py-8 text-center transition hover:border-(--brand-500) hover:bg-[rgba(184,76,43,0.04)] dark:border-white/12 dark:bg-(--surface-elevated)/55">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-(--brand-500) dark:text-(--brand-500)"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[14px] font-semibold text-(--text-primary) dark:text-(--text-primary)">
                Upload a cover image
              </span>
              <span className="text-[12px] text-(--text-secondary) dark:text-(--text-secondary)">
                PNG or JPG, up to 8MB. Drag inside the crop frame and scroll to zoom.
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
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
                    'relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-(--brand-500) bg-[#0e0c0a] dark:border-(--brand-500)',
                    dragging && 'cursor-grabbing'
                  )}
                >
                  <img
                    src={imageSrc}
                    alt="Banner crop preview"
                    className="select-none"
                    style={previewImageStyle}
                  />
                  <div className="pointer-events-none absolute inset-0 border border-white/20" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.01"
                    value={scale}
                    onChange={(event) => setScale(Number(event.target.value))}
                    className="w-full accent-(--brand-500) dark:accent-(--brand-500)"
                  />
                  <span className="w-12 text-right font-mono text-[10px] text-(--brand-500) dark:text-(--brand-500)">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'ai' && (
          <div className="flex flex-col gap-5">
            <div className="rounded-lg border-[1.5px] border-[rgba(99,65,168,0.24)] bg-[linear-gradient(135deg,rgba(99,65,168,0.12),rgba(59,108,183,0.10))] p-5">
              <div className="mb-2 flex items-center gap-2 text-[15px] font-bold text-(--text-primary) dark:text-(--text-primary)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-(--info)"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate a custom AI cover banner
              </div>

              <p className="mb-4 text-[13px] leading-[1.6] text-(--text-secondary) dark:text-(--text-secondary)">
                Describe the banner mood, scene, or theme. Imminiq will generate a preview, then you
                can drag and zoom it before applying.
              </p>

              <label className="mb-3 block">
                <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.16em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                  Banner Prompt
                </span>
                <textarea
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="A premium dark developer workspace with subtle neon green lighting, elegant depth, cinematic composition..."
                  rows={4}
                  maxLength={500}
                  className="min-h-26 w-full resize-y rounded-xl border-[1.5px] border-[rgba(99,65,168,0.26)] bg-white/85 px-3.5 py-3 text-[13px] leading-[1.6] text-(--text-primary) outline-none transition placeholder:text-[#9f8f86] focus:border-[#6341a8] focus:shadow-[0_0_0_3px_rgba(99,65,168,0.14)] dark:bg-(--surface-elevated)/85 dark:text-(--text-primary) dark:placeholder:text-[#7a756e]"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) opacity-70 dark:text-(--text-secondary)">
                  {aiPrompt.trim().length}/500 characters
                </span>

                <button
                  type="button"
                  onClick={handleGenerateAiBanner}
                  disabled={generateAiBannerPreviewMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#6341a8,var(--info))] px-4 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:opacity-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                >
                  {generateAiBannerPreviewMutation.isPending ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Generating...
                    </>
                  ) : (
                    'Generate Banner'
                  )}
                </button>
              </div>
            </div>

            {activeImageSource === 'ai' && imageSrc && (
              <>
                <div
                  ref={previewRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onWheel={handleWheel}
                  className={cn(
                    'relative aspect-4/1 touch-none overflow-hidden rounded-2xl border-2 border-[#6341a8] bg-[#0e0c0a] dark:border-(--info)',
                    dragging && 'cursor-grabbing'
                  )}
                >
                  <img
                    src={imageSrc}
                    alt="AI banner crop preview"
                    className="select-none"
                    style={previewImageStyle}
                  />
                  <div className="pointer-events-none absolute inset-0 border border-white/20" />
                  <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                    AI preview · drag to reposition
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--text-secondary) dark:text-(--text-secondary)">
                    Zoom
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.01"
                    value={scale}
                    onChange={(event) => setScale(Number(event.target.value))}
                    className="w-full accent-[#6341a8] dark:accent-(--info)"
                  />
                  <span className="w-12 text-right font-mono text-[10px] text-[#6341a8] dark:text-(--info)">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t border-(--border-subtle) px-6 py-4 dark:border-(--border-subtle)">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border-[1.5px] border-(--border-subtle) px-5 py-2.5 text-[13px] font-semibold text-(--text-secondary) transition hover:border-(--brand-500) hover:text-(--brand-500) dark:border-(--border-subtle) dark:text-(--text-secondary)"
        >
          Cancel
        </button>
        {tab === 'defaults' ? (
          <button
            type="button"
            onClick={async () => {
              try {
                const pngBannerDataUrl = await bannerDataUrlToPng(selectedBannerDataUrl);

                await onApply(pngBannerDataUrl);
              } catch {
                onToast('Unable to prepare this banner. Please try again.');
              }
            }}
            className="rounded-md bg-(--brand-500) px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            Apply Selected
          </button>
        ) : tab === 'upload' ? (
          <button
            type="button"
            onClick={applyUploadedBanner}
            disabled={activeImageSource !== 'upload' || !imageSrc}
            className="rounded-md bg-(--brand-500) px-5.5 py-2.5 text-[13px] font-bold text-[#fdf8f5] transition hover:-translate-y-px hover:bg-(--brand-600) disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-(--brand-500) dark:text-[#141412] dark:hover:bg-(--brand-600)"
          >
            {activeImageSource === 'upload' && imageSrc ? 'Apply Banner' : 'Upload First'}
          </button>
        ) : (
          <button
            type="button"
            onClick={applyUploadedBanner}
            disabled={activeImageSource !== 'ai' || !imageSrc}
            className="rounded-md bg-[#6341a8] px-5.5 py-2.5 text-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-[#543591] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 dark:bg-(--info) dark:text-[#141412] dark:hover:bg-[#5c8fd7]"
          >
            {activeImageSource === 'ai' && imageSrc ? 'Apply AI Banner' : 'Generate First'}
          </button>
        )}
      </div>
    </Modal>
  );
}
