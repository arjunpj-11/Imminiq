export type CommunityLeaderboardEntryEntityProps = {
  userId: string;
  rank: number;
  name: string;
  earnedCoins: number;
  badge: string;
  isCurrentUser: boolean;
};

export class CommunityLeaderboardEntryEntity {
  readonly userId: string;
  readonly rank: number;
  readonly name: string;
  readonly earnedCoins: number;
  readonly badge: string;
  readonly isCurrentUser: boolean;

  constructor(props: CommunityLeaderboardEntryEntityProps) {
    this.userId = props.userId;
    this.rank = props.rank;
    this.name = props.name;
    this.earnedCoins = props.earnedCoins;
    this.badge = props.badge;
    this.isCurrentUser = props.isCurrentUser;
  }
}
