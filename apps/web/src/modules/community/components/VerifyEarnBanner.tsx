import type { CommunityVerifyBanner } from '../types/community.types'
import { ArrowRightIcon, CoinsIcon } from './icons/CommunityIcons'

interface VerifyEarnBannerProps {
  banner: CommunityVerifyBanner
  onGo: () => void
}

export default function VerifyEarnBanner({
  banner,
  onGo,
}: VerifyEarnBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 rounded-xl border-[1.5px] border-[rgba(196,154,44,0.2)] bg-[rgba(196,154,44,0.06)] p-6 dark:border-[rgba(196,154,44,0.18)] dark:bg-[rgba(196,154,44,0.05)]">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(196,154,44,0.12)] dark:bg-[rgba(196,154,44,0.1)]">
          <span className="text-[#c49a2c]">
            <CoinsIcon />
          </span>
        </div>

        <div>
          <h2 className="mb-1 font-ui text-[18px] font-black leading-[1.2] text-(--text-primary) dark:text-(--text-primary)">
            Earn coins by reviewing trackers
          </h2>
          <p className="max-w-100 text-[12.5px] leading-[1.55] text-(--text-secondary) dark:text-(--text-secondary)">
            Vote on community submissions, help keep knowledge accurate, and earn coins every time you're in the majority.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-5">
            <div>
              <span className="font-ui text-[20px] font-black text-(--text-primary) dark:text-(--text-primary)">
                {banner.queueCount}
              </span>
              <span className="ml-1.5 font-mono text-[9px] uppercase tracking-widest text-[#9b9a92]">
                in queue
              </span>
            </div>
            <div className="h-5 w-px bg-(--border-subtle) dark:bg-white/10" />
            <div>
              <span className="font-ui text-[20px] font-black text-[#c49a2c]">
                +{banner.rewardCoins}
              </span>
              <span className="ml-1.5 font-mono text-[9px] uppercase tracking-widest text-[#9b9a92]">
                coins / review
              </span>
            </div>
            <div className="h-5 w-px bg-(--border-subtle) dark:bg-white/10" />
            <div>
              <span className="font-ui text-[20px] font-black text-(--text-primary) dark:text-(--text-primary)">
                {banner.activeReviewersThisWeek}
              </span>
              <span className="ml-1.5 font-mono text-[9px] uppercase tracking-widest text-[#9b9a92]">
                active this week
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onGo}
        className="inline-flex shrink-0 items-center gap-2 rounded-md border-[1.5px] border-[rgba(196,154,44,0.35)] bg-[rgba(196,154,44,0.1)] px-5 py-2.5 text-[13px] font-bold text-[#c49a2c] transition hover:-translate-y-px hover:bg-[rgba(196,154,44,0.18)] hover:shadow-[0_8px_24px_rgba(196,154,44,0.15)] dark:border-[rgba(196,154,44,0.3)] dark:hover:bg-[rgba(196,154,44,0.15)] max-[560px]:w-full max-[560px]:justify-center"
      >
        Verify &amp; earn <ArrowRightIcon />
      </button>
    </div>
  )
}
