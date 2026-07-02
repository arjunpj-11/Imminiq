import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export type StatTone = 'rust' | 'green' | 'amber' | 'blue'
export interface StatAccent {
  light: string
  dark: string
}

const toneAccents: Record<StatTone, StatAccent> = {
  rust: { light: '#b84c2b', dark: '#e8816a' },
  green: { light: '#2d6a47', dark: '#3dbf82' },
  amber: { light: '#c98000', dark: '#f0a832' },
  blue: { light: '#3b6cb7', dark: '#4a9eff' },
}

interface StatCardProps {
  label: ReactNode
  value?: ReactNode
  helper?: ReactNode
  footer?: ReactNode
  action?: ReactNode
  children?: ReactNode
  tone?: StatTone
  accent?: StatAccent
  className?: string
  valueClassName?: string
}

export default function StatCard({
  label,
  value,
  helper,
  footer,
  action,
  children,
  tone = 'rust',
  accent,
  className,
  valueClassName,
}: StatCardProps) {
  const selectedAccent = accent ?? toneAccents[tone]

  return (
    <div
      className={cn(
        'group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20',
        className,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
        style={{
          background: `linear-gradient(90deg, transparent, ${selectedAccent.light}, transparent)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
        style={{
          background: `linear-gradient(90deg, transparent, ${selectedAccent.dark}, transparent)`,
        }}
      />

      <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
        {label}
      </div>

      {value !== undefined && (
        <div
          className={cn(
            "mt-4 font-['Playfair_Display',serif] text-[30px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb] sm:text-[34px]",
            valueClassName,
          )}
        >
          {value}
        </div>
      )}

      {children}

      {helper && (
        <div className="mt-3 flex-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
          {helper}
        </div>
      )}

      {footer && <div className="mt-2">{footer}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
