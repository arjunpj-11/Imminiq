import { cn } from '../utils/tracker-ui'

interface TrackerStatCardProps {
  label: string
  value: string | number
  helper?: string
  tone?: 'rust' | 'green' | 'amber' | 'blue'
}

const tones = {
  rust: 'from-[#e8816a] to-[#b84c2b]',
  green: 'from-[#70d49a] to-[#4caf7d]',
  amber: 'from-[#e8c060] to-[#c98000]',
  blue: 'from-[#7aa4e8] to-[#3b6cb7]',
}

export default function TrackerStatCard({ label, value, helper, tone = 'rust' }: TrackerStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] p-4 shadow-[0_2px_16px_rgba(26,23,20,0.06)] dark:border-white/9 dark:bg-[#1e1c19]">
      <div className={cn('absolute left-0 right-0 top-0 h-0.75 bg-linear-to-r', tones[tone])} />
      <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#6b5f58] opacity-55 dark:text-[#9b9a92]">{label}</div>
      <div className="mt-2 font-['Playfair_Display',serif] text-3xl font-extrabold tracking-[-0.6px] text-[#1a1714] dark:text-[#f2f0eb]">{value}</div>
      {helper && <p className="mt-1 text-[12px] text-[#6b5f58] dark:text-[#9b9a92]">{helper}</p>}
    </div>
  )
}
