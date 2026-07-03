import { cn } from '../../../lib/cn'
export { cn }

export const communityPageClass =
  'mx-auto mt-5.5 flex w-[min(1180px,calc(100%-48px))] max-w-full min-w-0 flex-col gap-6 pb-[calc(80px+env(safe-area-inset-bottom,0)+16px)] max-[900px]:mt-4.5 max-[900px]:w-[min(100%,calc(100%-32px))] max-[640px]:mt-3 max-[640px]:w-[calc(100%-20px)]'

export const communitySurfaceClass =
  'rounded-[var(--radius-lg)] border-[1.5px] border-[var(--border-subtle)] bg-[var(--surface-card)] dark:border-[var(--border-subtle)] dark:bg-[var(--surface-card)]'

export const communityMutedTextClass =
  'text-[var(--text-secondary)] dark:text-[var(--text-secondary)]'

export const communityEyebrowClass =
  "font-mono text-[8.5px] uppercase tracking-[0.12em]"

export const communityButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border-[1.5px] px-5 py-2.5 text-[13px] font-bold transition hover:-translate-y-px'
