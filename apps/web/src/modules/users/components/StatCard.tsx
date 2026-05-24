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
    rust: "from-[#e8816a] to-[#b84c2b]",
    green: "from-[#70d49a] to-[#4caf7d]",
    amber: "from-[#e8c060] to-[#c98000]",
    blue: "from-[#7aa4e8] to-[#3b6cb7]",
  };
  return (
    <div className="relative overflow-hidden bg-[#fdf8f5] dark:bg-[#1e1c19] border-[1.5px] border-[#e0d0c5] dark:border-white/9 rounded-2xl p-4 flex flex-col gap-2 shadow-[0_2px_16px_rgba(26,23,20,0.06)]">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[2.5px] rounded-t-2xl bg-linear-to-r",
          accentColors[accent],
        )}
      />
      <div className="font-['DM_Mono',monospace] text-[8px] tracking-[0.14em] uppercase text-[#6b5f58] dark:text-[#9b9a92] opacity-55 mt-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}
