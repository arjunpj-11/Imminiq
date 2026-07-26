export type UserEntityProps = {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  coins: number;
  xp: number;
  level: number;
  teacherXp: number;
  teacherLevel: number;
  streakCount: number;
  isPremium?: boolean;
  avatarUrl: string;
  provider: string;
  referralCode: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class UserEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly email?: string;
  readonly role: string;
  readonly status: string;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly onboardingCompleted: boolean;
  readonly coins: number;
  readonly xp: number;
  readonly level: number;
  readonly teacherXp: number;
  readonly teacherLevel: number;
  readonly streakCount: number;
  readonly isPremium: boolean;
  readonly avatarUrl: string;
  readonly provider: string;
  readonly referralCode: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: UserEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    if (props.email !== undefined) this.email = props.email;
    this.role = props.role;
    this.status = props.status;
    this.emailVerified = props.emailVerified;
    this.phoneVerified = props.phoneVerified;
    this.onboardingCompleted = props.onboardingCompleted;
    this.coins = props.coins;
    this.xp = props.xp;
    this.level = props.level;
    this.teacherXp = props.teacherXp;
    this.teacherLevel = props.teacherLevel;
    this.streakCount = props.streakCount;
    this.isPremium = Boolean(props.isPremium);
    this.avatarUrl = props.avatarUrl;
    this.provider = props.provider;
    this.referralCode = props.referralCode;
    if (props.createdAt !== undefined) this.createdAt = props.createdAt;
    if (props.updatedAt !== undefined) this.updatedAt = props.updatedAt;
  }
}
