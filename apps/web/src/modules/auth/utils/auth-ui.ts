import { cn } from '../../../lib/cn'
export { cn }

export const authLabelClass =
  "font-mono text-[9.5px] font-medium uppercase tracking-[0.1em] text-[#1a1714] dark:text-[#f2f0eb]"

export const authErrorClass =
  'mt-1.5 flex items-center gap-1.5 text-[11.5px] leading-normal text-[#d94535] dark:text-[#ff6b5f]'

export const authInputClass = (error?: string, valid?: boolean) =>
  cn(
    'w-full rounded-[10px] border-[1.5px] bg-white px-3.5 py-[11px] text-sm text-[#1a1714] outline-none transition',
    'placeholder:text-[#9f8f86]',
    'focus:border-[#b84c2b] focus:shadow-[0_0_0_3px_rgba(184,76,43,0.09)]',
    'dark:border-white/15 dark:bg-[#252320] dark:text-[#f2f0eb] dark:placeholder:text-[#aaa59d]',
    'dark:focus:border-[#e8816a] dark:focus:shadow-[0_0_0_3px_rgba(232,129,106,0.18)]',
    error &&
      'border-[#d94535] bg-[rgba(217,69,53,0.07)] shadow-[0_0_0_3px_rgba(217,69,53,0.08)] dark:border-[#ff6b5f] dark:bg-[rgba(255,107,95,0.10)]',
    valid &&
      !error &&
      'border-[#4caf7d] shadow-[0_0_0_3px_rgba(76,175,125,0.08)] dark:border-[#5cc98a]'
  )
