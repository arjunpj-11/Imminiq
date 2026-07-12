import type { ILeaderboardResponse } from '../types/leaderboard.types'
import LeaderboardMyRankBar from './LeaderboardMyRankBar'
import LeaderboardPodium from './LeaderboardPodium'
import LeaderboardSidebar from './LeaderboardSidebar'
import LeaderboardTable from './LeaderboardTable'

export default function LeaderboardSectionView({
  leaderboard,
}: {
  leaderboard: ILeaderboardResponse
}) {
  const currentUserIsInPodium = leaderboard.currentUser
    ? leaderboard.topThree.some(
        (entry) => entry.userId === leaderboard.currentUser?.userId,
      )
    : false

  return (
    <div className="flex items-start gap-5 max-[860px]:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <LeaderboardPodium entries={leaderboard.topThree} />
        <LeaderboardTable
          section={leaderboard.section}
          entries={leaderboard.entries}
          currentUser={
            currentUserIsInPodium ? null : leaderboard.currentUser
          }
        />
        {leaderboard.currentUser && (
          <LeaderboardMyRankBar entry={leaderboard.currentUser} />
        )}
      </div>

      <LeaderboardSidebar
        weekly={leaderboard.weekly}
        scoringRules={leaderboard.scoringRules}
        streakChampions={leaderboard.streakChampions}
        reward={leaderboard.reward}
      />
    </div>
  )
}
