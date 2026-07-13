import type { AuthRole } from '../value-objects/auth-role.vo';
import type { UserStatus } from '../value-objects/user-status.vo';

export type AuthUserEntityProps = {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium: boolean;
  avatarUrl?: string | null;
  onboardingCompleted: boolean;
  passwordHash?: string | null;
  scheduledDeletionAt?: Date | string | null;
};

export class AuthUserEntity {
  readonly id: string;
  readonly fullName: string;
  readonly username: string;
  readonly email?: string;
  readonly phone?: string;
  readonly role: AuthRole;
  readonly status: UserStatus;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly isPremium: boolean;
  readonly avatarUrl?: string | null;
  readonly onboardingCompleted: boolean;
  readonly passwordHash?: string | null;
  readonly scheduledDeletionAt?: Date | string | null;

  constructor(props: AuthUserEntityProps) {
    this.id = props.id;
    this.fullName = props.fullName;
    this.username = props.username;
    this.email = props.email;
    this.phone = props.phone;
    this.role = props.role;
    this.status = props.status;
    this.emailVerified = props.emailVerified;
    this.phoneVerified = props.phoneVerified;
    this.isPremium = props.isPremium;
    this.avatarUrl = props.avatarUrl;
    this.onboardingCompleted = props.onboardingCompleted;
    this.passwordHash = props.passwordHash;
    this.scheduledDeletionAt = props.scheduledDeletionAt;
  }
}
