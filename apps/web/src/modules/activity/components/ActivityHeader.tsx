import { FireIcon, LiveDotIcon } from './icons/ActivityIcons'

interface ActivityHeaderProps {
  currentStreak: number
}

export default function ActivityHeader({
  currentStreak,
}: ActivityHeaderProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-5">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(184,76,43,0.15)] bg-[rgba(184,76,43,0.07)] px-3 py-1.25">
          <LiveDotIcon />
          <span className="font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.13em] text-[#b84c2b] dark:text-[#e8816a]">
            Personal
          </span>
        </div>

        <h1 className="font-['Playfair_Display',serif] text-[clamp(28px,3.5vw,40px)] font-black leading-[1.08] tracking-[-0.5px] text-[#1a1714] dark:text-[#f2f0eb]">
          Your{' '}
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            Activity
          </span>
        </h1>

        <p className="mt-2.5 max-w-105 text-[13px] italic leading-[1.6] text-[#7a6e66] dark:text-[#9b9a92]">
          Track sessions, XP earned, streaks, and your learning rhythm
          over time.
        </p>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-[18px] border-[1.5px] border-[#e0d0c5] bg-[#fdf8f5] dark:border-white/9 dark:bg-[#1e1c19] max-[560px]:w-full">
        <div className="flex flex-col justify-center px-5 py-4">
          <div className="mb-1 font-['DM_Mono',monospace] text-[8px] uppercase tracking-[0.14em] text-[#b0a097] dark:text-[#6b6460]">
            Current streak
          </div>
          <span className="font-['Playfair_Display',serif] text-[40px] font-black leading-none text-[#b84c2b] tabular-nums dark:text-[#e8816a]">
            {Math.max(0, currentStreak)}d
          </span>
        </div>

        <div className="w-px self-stretch bg-[#e0d0c5] dark:bg-white/9" />

        <div className="flex flex-col items-center justify-center gap-1 px-4">
          <span className="text-[#b84c2b] dark:text-[#e8816a]">
            <FireIcon size={22} />
          </span>
          <div className="font-['DM_Mono',monospace] text-[8px] uppercase tracking-wider text-[#b0a097] dark:text-[#6b6460]">
            {currentStreak > 0 ? 'keep it up' : 'start today'}
          </div>
        </div>
      </div>
    </section>
  )
}
