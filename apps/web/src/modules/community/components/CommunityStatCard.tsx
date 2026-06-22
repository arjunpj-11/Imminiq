import type { ReactNode } from 'react'

interface CommunityStatCardProps {
  label: string
  value: string | number
  helper: string
  accent: { light: string; dark: string }
  action?: ReactNode
}

export default function CommunityStatCard({
  label,
  value,
  helper,
  accent,
  action,
}: CommunityStatCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(184,76,43,0.20)] hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20">
      <div
        className="absolute inset-x-0 top-0 h-[2.5px] dark:hidden"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.light}, transparent)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 hidden h-[2.5px] dark:block"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.dark}, transparent)`,
        }}
      />
      <div className="font-['DM_Mono',monospace] text-[9px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-70 dark:text-[#9b9a92]">
        {label}
      </div>
      <div className="mt-4 font-['Playfair_Display',serif] text-[34px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb]">
        {value}
      </div>
      <p className="mt-3 flex-1 text-[12px] leading-normal text-[#6b5f58] dark:text-[#6b6560]">
        {helper}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
