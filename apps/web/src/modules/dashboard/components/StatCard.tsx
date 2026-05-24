import type { ReactNode } from 'react'

import { cn } from '../utils/cn'

type StatCardProps = {
  accent: 'rust' | 'green' | 'amber' | 'blue'
  label: string
  value: string
  footer: ReactNode
}

export default function StatCard({
  accent,
  label,
  value,
  footer,
}: StatCardProps) {
  const accentClass = {
    rust: 'from-[#e8816a] to-[#b84c2b]',
    green: 'from-[#70d49a] to-[#4caf7d]',
    amber: 'from-[#e8c060] to-[#c98000]',
    blue: 'from-[#7aa4e8] to-[#3b6cb7]',
  }[accent]

  return (
    <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div
        className={cn(
          'absolute left-0 right-0 top-0 h-[2.5px] rounded-t-2xl bg-linear-to-r',
          accentClass
        )}
      />

      <div className="mb-2 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">
        {label}
      </div>

      <div className="font-['Playfair_Display',serif] text-[clamp(30px,4vw,40px)] font-extrabold leading-none tracking-[-2px] text-[#1a1714] dark:text-[#f2f0eb]">
        {value}
      </div>

      <div className="mt-2">{footer}</div>
    </div>
  )
}
