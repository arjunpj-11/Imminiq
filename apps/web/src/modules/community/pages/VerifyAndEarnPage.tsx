import { useNavigate } from 'react-router-dom'

import CommunityErrorState from '../components/CommunityErrorState'
import CommunityLayout from '../components/CommunityLayout'
import CommunityPageSkeleton from '../components/CommunityPageSkeleton'
import CommunityPagination from '../components/CommunityPagination'
import CommunityStatCard from '../components/CommunityStatCard'
import VerificationCard from '../components/VerificationCard'
import VerificationHowItWorks from '../components/VerificationHowItWorks'
import VerificationLeaderboard from '../components/VerificationLeaderboard'
import VerificationTipCard from '../components/VerificationTipCard'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CoinsIcon,
} from '../components/icons/CommunityIcons'
import {
  COMMUNITY_VERIFY_PAGE_LIMIT,
  COMMUNITY_VERIFY_STAT_ACCENTS,
} from '../constants/community.constants'
import { useVerificationDashboard } from '../hooks/useVerificationDashboard'
import { useCommunityStore } from '../store/useCommunityStore'
import { getApiErrorMessage } from '../utils/community-formatters'
import { communityPageClass } from '../utils/community-ui'

export default function VerifyAndEarnPage() {
  const navigate = useNavigate()
  const verifyPage = useCommunityStore((state) => state.verifyPage)
  const setVerifyPage = useCommunityStore((state) => state.setVerifyPage)
  const dashboard = useVerificationDashboard({
    page: verifyPage,
    limit: COMMUNITY_VERIFY_PAGE_LIMIT,
  })

  if (dashboard.isLoading && !dashboard.data) {
    return <CommunityPageSkeleton variant="verify" />
  }

  return (
    <CommunityLayout>
      <div className={communityPageClass}>
        {dashboard.isError || !dashboard.data ? (
          <CommunityErrorState
            title="Verification unavailable"
            message={getApiErrorMessage(
              'Something went wrong loading verification data.',
              dashboard.error?.response?.data?.message,
            )}
            actionLabel="Try again"
            onAction={() => void dashboard.refetch()}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e0d0c5] bg-[#fdf8f5] px-3 py-1.5 text-[12px] font-bold text-[#6b5f58] transition hover:border-[rgba(184,76,43,0.24)] hover:text-[#b84c2b] dark:border-white/9 dark:bg-[#1e1c19] dark:text-[#9b9a92] dark:hover:text-[#e8816a]"
            >
              <ArrowLeftIcon /> Back to community
            </button>

            <section className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(196,154,44,0.22)] bg-[rgba(196,154,44,0.08)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-[0.12em] text-[#7c5a1e] dark:border-[rgba(196,154,44,0.3)] dark:bg-[rgba(196,154,44,0.10)] dark:text-[#c49a2c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c49a2c]" />
                  Verify &amp; earn
                </div>
                <h1 className="font-['Playfair_Display',serif] text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.15] tracking-[-0.8px] text-[#1a1714] dark:text-[#f2f0eb]">
                  Review trackers ·{' '}
                  <span className="text-[#c49a2c]">Earn coins</span>
                </h1>
                <p className="mt-2 max-w-125 text-[13px] italic leading-[1.55] text-[#6b5f58] opacity-80 dark:text-[#9b9a92]">
                  Validate community submissions and keep the knowledge commons accurate.
                </p>
              </div>

              <div className="flex items-center gap-5 rounded-[14px] border-[1.5px] border-[rgba(196,154,44,0.18)] bg-[rgba(196,154,44,0.05)] px-5 py-3.5 dark:border-[rgba(196,154,44,0.15)] dark:bg-[rgba(196,154,44,0.04)]">
                <div className="text-center">
                  <div className="font-['Playfair_Display',serif] text-[26px] font-black leading-none text-[#1a1714] dark:text-[#f2f0eb]">
                    {dashboard.data.stats.queueCount}
                  </div>
                  <div className="mt-1 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
                    In queue
                  </div>
                </div>
                <div className="h-7 w-px bg-[rgba(196,154,44,0.18)]" />
                <div className="text-center">
                  <div className="font-['Playfair_Display',serif] text-[26px] font-black leading-none text-[#c49a2c]">
                    +{dashboard.data.stats.rewardCoins}
                  </div>
                  <div className="mt-1 font-['DM_Mono',monospace] text-[7.5px] uppercase tracking-widest text-[#9b9a92]">
                    Per review
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CommunityStatCard
                label="Awaiting"
                value={dashboard.data.stats.awaiting}
                helper="Submissions to review"
                accent={COMMUNITY_VERIFY_STAT_ACCENTS.amber}
              />
              <CommunityStatCard
                label="Reviewed"
                value={dashboard.data.stats.reviewed}
                helper="Verified by you total"
                accent={COMMUNITY_VERIFY_STAT_ACCENTS.green}
              />
              <CommunityStatCard
                label="Total earned"
                value={dashboard.data.stats.totalEarned}
                helper="Coins from reviews"
                accent={COMMUNITY_VERIFY_STAT_ACCENTS.rust}
              />
              <CommunityStatCard
                label="Coin balance"
                value={dashboard.data.stats.coinBalance}
                helper="Available to redeem"
                accent={COMMUNITY_VERIFY_STAT_ACCENTS.purple}
                action={
                  <button
                    type="button"
                    onClick={() => navigate('/store')}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[rgba(107,70,193,0.28)] bg-[rgba(107,70,193,0.07)] px-3 py-1.5 font-['DM_Mono',monospace] text-[9px] font-bold uppercase tracking-[0.08em] text-[#6b46c1] transition hover:border-[rgba(107,70,193,0.45)] hover:bg-[rgba(107,70,193,0.13)] dark:border-[rgba(167,139,250,0.3)] dark:bg-[rgba(167,139,250,0.08)] dark:text-[#a78bfa] dark:hover:bg-[rgba(167,139,250,0.15)]"
                  >
                    <CoinsIcon /> Redeem store <ArrowRightIcon />
                  </button>
                }
              />
            </div>

            <div className="flex items-start gap-6 max-[860px]:flex-col">
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-['Playfair_Display',serif] text-[16px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                    Open for review
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,76,43,0.16)] bg-[rgba(184,76,43,0.07)] px-3 py-1 font-['DM_Mono',monospace] text-[8.5px] uppercase tracking-widest text-[#b84c2b] dark:border-[rgba(232,129,106,0.22)] dark:text-[#e8816a]">
                    {dashboard.data.pagination.total} pending
                  </span>
                </div>

                {dashboard.data.items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                    {dashboard.data.items.map((item) => (
                      <VerificationCard
                        key={item._id}
                        item={item}
                        onPreview={(submissionId) =>
                          navigate(`/community/verify/${submissionId}`)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] border-[1.5px] border-dashed border-[#e0d0c5] bg-[#fdf8f5] px-6 py-10 text-center dark:border-white/10 dark:bg-[#1e1c19]">
                    <h2 className="font-['Playfair_Display',serif] text-[20px] font-extrabold text-[#1a1714] dark:text-[#f2f0eb]">
                      Review queue is empty
                    </h2>
                    <p className="mt-2 text-[13px] leading-normal text-[#6b5f58] dark:text-[#9b9a92]">
                      Come back later when new community trackers need review.
                    </p>
                  </div>
                )}

                <CommunityPagination
                  pagination={dashboard.data.pagination}
                  onPageChange={setVerifyPage}
                />
              </div>

              <aside className="flex w-68 shrink-0 flex-col gap-4 max-[860px]:grid max-[860px]:w-full max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
                <VerificationLeaderboard entries={dashboard.data.leaderboard} />
                <VerificationHowItWorks steps={dashboard.data.howItWorks} />
                <VerificationTipCard />
              </aside>
            </div>
          </>
        )}
      </div>
    </CommunityLayout>
  )
}
