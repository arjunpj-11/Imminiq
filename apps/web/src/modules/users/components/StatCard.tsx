import type { ReactNode } from 'react'

import { cn } from '../utils/profile-ui.utils'

/* ─── Stat Card ─── */
export default function StatCard({
  accent,
  label,
  children,
}: {
  accent: 'rust' | 'green' | 'amber' | 'blue'
  label: string
  children: ReactNode
}) {
  const accentColors = {
    rust: {
      light: '#b84c2b',
      dark: '#e8816a',
      hover: 'hover:border-[rgba(184,76,43,0.20)]',
    },
    green: {
      light: '#2d6a47',
      dark: '#3dbf82',
      hover: 'hover:border-[rgba(45,106,71,0.20)]',
    },
    amber: {
      light: '#c98000',
      dark: '#f0a832',
      hover: 'hover:border-[rgba(201,128,0,0.22)]',
    },
    blue: {
      light: '#3b6cb7',
      dark: '#4a9eff',
      hover: 'hover:border-[rgba(59,108,183,0.20)]',
    },
  }

  const selectedAccent = accentColors[accent]

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20',
        selectedAccent.hover
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2.5px]"
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

      {children}
    </div>
  )
}