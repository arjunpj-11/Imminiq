import type { BadgeType } from '../value-objects/badge-type.vo';

export type UserBadgeEntityProps = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  badgeType: BadgeType;
  criteria: Record<string, unknown>;
};

export class UserBadgeEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconUrl: string;
  readonly badgeType: BadgeType;
  readonly criteria: Record<string, unknown>;

  constructor(props: UserBadgeEntityProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.iconUrl = props.iconUrl;
    this.badgeType = props.badgeType;
    this.criteria = props.criteria;
  }
}
