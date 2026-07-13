import type { UserSettingsEntity } from '../entities/user-settings.entity';
import type {
  AIResponseStyleType,
  DigestFrequencyType,
  MessagePermissionType,
  ProfileVisibilityType,
  QuietHoursDayType,
  ThemeType,
} from '../settings.types';
import type { NotificationTypeSettings } from '../settings.types';

export type SettingsAppearanceUpdateInput = {
  theme?: ThemeType;
};

export type SettingsNotificationsUpdateInput = {
  globalEnabled?: boolean;
  globalEmail?: boolean;
  globalPush?: boolean;
  marketing?: boolean;
  weeklyReport?: boolean;
  types?: Partial<NotificationTypeSettings>;
};

export type SettingsNotificationTypesUpdateInput = {
  types: Partial<NotificationTypeSettings>;
};

export type SettingsPrivacyUpdateInput = {
  profileVisibility?: ProfileVisibilityType;
  showProfile?: boolean;
  showStreak?: boolean;
  showProgress?: boolean;
  showLeaderboardRank?: boolean;
  showActivity?: boolean;
  showOnlineStatus?: boolean;
  showStats?: boolean;
  allowFriendRequests?: boolean;
  allowChallenges?: boolean;
  allowMessages?: boolean;
  messagePermission?: MessagePermissionType;
  allowPublicTrackerView?: boolean;
  allowTrackerCloning?: boolean;
  showTrackerProgress?: boolean;
};

export type SettingsCodeEditorUpdateInput = {
  theme?: string;
  fontSize?: number;
  tabSize?: number;
  autoIndent?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  minimap?: boolean;
};

export type SettingsCompilerUpdateInput = {
  defaultLanguage?: string;
  defaultRuntime?: string;
  autoSwitchLanguage?: boolean;
};

export type SettingsAIBehaviourUpdateInput = {
  responseStyle?: AIResponseStyleType;
  autoGenerateLessons?: boolean;
  showAIInsights?: boolean;
  dailyQuotaAlert?: boolean;
};

export type SettingsLearningJourneyUpdateInput = {
  dailyGoalMinutes?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  autoPlayNextTopic?: boolean;
  showEstimatedTime?: boolean;
};

export type SettingsGesturesUpdateInput = {
  enabled?: boolean;
  sensitivity?: number;
  swipeToNext?: boolean;
  swipeToPrevious?: boolean;
  pinchToZoom?: boolean;
  backGesture?: boolean;
  zoomGesture?: boolean;
  annotateGesture?: boolean;
  scrollGesture?: boolean;
};

export type SettingsQuietHoursUpdateInput = {
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursDays?: QuietHoursDayType[];
};

export type SettingsEmailDigestUpdateInput = {
  enabled?: boolean;
  frequency?: DigestFrequencyType;
  includeActivity?: boolean;
  includeRecommendations?: boolean;
};

export type SettingsAccountUpdateInput = {
  language?: string;
  timezone?: string;
  dateFormat?: string;
};

export type UpdateSettingsAppearanceInput = {
  userId: string;
  data: SettingsAppearanceUpdateInput;
};

export type UpdateSettingsNotificationsInput = {
  userId: string;
  data: Omit<SettingsNotificationsUpdateInput, 'types'>;
};

export type UpdateSettingsNotificationTypesInput = {
  userId: string;
  types: Partial<NotificationTypeSettings>;
};

export type UpdateSettingsPrivacyInput = {
  userId: string;
  data: SettingsPrivacyUpdateInput;
};

export type UpdateSettingsCodeEditorInput = {
  userId: string;
  data: SettingsCodeEditorUpdateInput;
};

export type UpdateSettingsCompilerInput = {
  userId: string;
  data: SettingsCompilerUpdateInput;
};

export type UpdateSettingsAIBehaviourInput = {
  userId: string;
  data: SettingsAIBehaviourUpdateInput;
};

export type UpdateSettingsLearningJourneyInput = {
  userId: string;
  data: SettingsLearningJourneyUpdateInput;
};

export type UpdateSettingsGesturesInput = {
  userId: string;
  data: SettingsGesturesUpdateInput;
};

export type UpdateSettingsQuietHoursInput = {
  userId: string;
  data: SettingsQuietHoursUpdateInput;
};

export type UpdateSettingsEmailDigestInput = {
  userId: string;
  data: SettingsEmailDigestUpdateInput;
};

export type UpdateSettingsAccountInput = {
  userId: string;
  data: SettingsAccountUpdateInput;
};

export interface ISettingsCommandRepository {
  updateAppearance(input: UpdateSettingsAppearanceInput): Promise<UserSettingsEntity | null>;

  updateNotifications(input: UpdateSettingsNotificationsInput): Promise<UserSettingsEntity | null>;

  updateNotificationTypes(
    input: UpdateSettingsNotificationTypesInput
  ): Promise<UserSettingsEntity | null>;

  updatePrivacy(input: UpdateSettingsPrivacyInput): Promise<UserSettingsEntity | null>;

  updateCodeEditor(input: UpdateSettingsCodeEditorInput): Promise<UserSettingsEntity | null>;

  updateCompiler(input: UpdateSettingsCompilerInput): Promise<UserSettingsEntity | null>;

  updateAIBehaviour(input: UpdateSettingsAIBehaviourInput): Promise<UserSettingsEntity | null>;

  updateLearningJourney(
    input: UpdateSettingsLearningJourneyInput
  ): Promise<UserSettingsEntity | null>;

  updateGestures(input: UpdateSettingsGesturesInput): Promise<UserSettingsEntity | null>;

  updateQuietHours(input: UpdateSettingsQuietHoursInput): Promise<UserSettingsEntity | null>;

  updateEmailDigest(input: UpdateSettingsEmailDigestInput): Promise<UserSettingsEntity | null>;

  updateAccountSettings(input: UpdateSettingsAccountInput): Promise<UserSettingsEntity | null>;

  resetToDefaults(userId: string): Promise<UserSettingsEntity>;
}
