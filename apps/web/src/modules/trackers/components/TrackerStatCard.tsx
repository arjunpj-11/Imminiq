import { cn } from '../utils/tracker-ui'

interface TrackerStatCardProps {
  label: string
  value: string | number
  helper?: string
  tone?: 'rust' | 'green' | 'amber' | 'blue'
}

const tones: Record<
  NonNullable<TrackerStatCardProps['tone']>,
  {
    light: string
    dark: string
    hover: string
  }
> = {
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

export default function TrackerStatCard({
  label,
  value,
  helper,
  tone = 'rust',
}: TrackerStatCardProps) {
  const accent = tones[tone]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[#e0d0c5] bg-[#fdf8f5] p-5 shadow-[0_2px_16px_rgba(26,23,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_40px_rgba(26,23,20,0.10)] dark:border-white/10 dark:bg-[#1c1a18] dark:hover:border-white/20',
        accent.hover
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2.5px]"
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

      <div className="mt-4 font-['Playfair_Display',serif] text-[30px] font-black leading-none tracking-[-1.5px] text-[#1a1714] dark:text-[#f2f0eb] sm:text-[34px]">
        {value}
      </div>

      {helper && (
        <p className="mt-3 text-[12px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
          {helper}
        </p>
      )}
    </div>
  )
}