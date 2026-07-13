export type CommunityMemberStatsEntityProps = {
  publishedCount: number;
  clonesReceived: number;
  clonedByUser: number;
  averageRating: number;
};

export class CommunityMemberStatsEntity {
  readonly publishedCount: number;
  readonly clonesReceived: number;
  readonly clonedByUser: number;
  readonly averageRating: number;

  constructor(props: CommunityMemberStatsEntityProps) {
    this.publishedCount = props.publishedCount;
    this.clonesReceived = props.clonesReceived;
    this.clonedByUser = props.clonedByUser;
    this.averageRating = props.averageRating;
  }
}
