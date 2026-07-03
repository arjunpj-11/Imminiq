import { cn } from '../../../lib/cn'
export { cn }

export const authLabelClass =
  "font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-[var(--text-primary)] dark:text-[var(--text-primary)]"

export const authErrorClass =
  'mt-1.5 flex items-center gap-1.5 text-[11.5px] leading-normal text-[var(--danger)] dark:text-[var(--danger)]'

export const authInputClass = (error?: string, valid?: boolean) =>
  cn(
    'w-full rounded-[var(--radius-md)] border-[1.5px] bg-white px-3.5 py-[11px] text-sm text-[var(--text-primary)] outline-none transition',
    'placeholder:text-[#9f8f86]',
    'focus:border-[var(--brand-500)] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
    'dark:border-white/15 dark:bg-[var(--surface-elevated)] dark:text-[var(--text-primary)] dark:placeholder:text-[#aaa59d]',
    'dark:focus:border-[var(--brand-500)] dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
    error &&
      'border-[var(--danger)] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[var(--danger)] dark:bg-[rgba(255,107,95,0.10)]',
    valid &&
      !error &&
      'border-[var(--success)] shadow-[0_0_0_3px_rgba(76,175,125,0.08)] dark:border-[var(--success)]'
  )
