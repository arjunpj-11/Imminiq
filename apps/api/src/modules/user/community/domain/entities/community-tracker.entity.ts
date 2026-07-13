export type CommunityTrackerEntityProps = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  rating: number;
  clones: number;
  verified: boolean;
  inDashboard: boolean;
  topic: string;
  createdAt?: Date;
};

export class CommunityTrackerEntity {
  readonly id: string;
  readonly ownerId: string;
  readonly title: string;
  readonly description: string;
  readonly rating: number;
  readonly clones: number;
  readonly verified: boolean;
  readonly inDashboard: boolean;
  readonly topic: string;
  readonly createdAt?: Date;

  constructor(props: CommunityTrackerEntityProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.title = props.title;
    this.description = props.description;
    this.rating = props.rating;
    this.clones = props.clones;
    this.verified = props.verified;
    this.inDashboard = props.inDashboard;
    this.topic = props.topic;
    this.createdAt = props.createdAt;
  }
}
