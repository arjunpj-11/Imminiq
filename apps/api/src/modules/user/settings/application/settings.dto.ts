import type {
  AIResponseStyleType,
  DigestFrequencyType,
  MessagePermissionType,
  ProfileVisibilityType,
  QuietHoursDayType,
  ThemeType,
} from '../domain/settings.types';
import type { NotificationTypeSettings, UserSettingsData } from '../domain/settings.types';

export interface UpdateAppearancePayloadDTO {
  theme?: ThemeType;
}

export interface UpdateNotificationsPayloadDTO {
  globalEnabled?: boolean;
  globalEmail?: boolean;
  globalPush?: boolean;
  marketing?: boolean;
  weeklyReport?: boolean;
  types?: Partial<NotificationTypeSettings>;
}

export interface UpdatePrivacyPayloadDTO {
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
}

export interface UpdateCodeEditorPayloadDTO {
  theme?: string;
  fontSize?: number;
  tabSize?: number;
  autoIndent?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  minimap?: boolean;
}

export interface UpdateCompilerPayloadDTO {
  defaultLanguage?: string;
  defaultRuntime?: string;
  autoSwitchLanguage?: boolean;
}

export interface UpdateAIBehaviourPayloadDTO {
  responseStyle?: AIResponseStyleType;
  autoGenerateLessons?: boolean;
  showAIInsights?: boolean;
  dailyQuotaAlert?: boolean;
}

export interface UpdateLearningJourneyPayloadDTO {
  dailyGoalMinutes?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  autoPlayNextTopic?: boolean;
  showEstimatedTime?: boolean;
}

export interface UpdateGesturesPayloadDTO {
  enabled?: boolean;
  sensitivity?: number;
  swipeToNext?: boolean;
  swipeToPrevious?: boolean;
  pinchToZoom?: boolean;
  backGesture?: boolean;
  zoomGesture?: boolean;
  annotateGesture?: boolean;
  scrollGesture?: boolean;
}

export interface UpdateQuietHoursPayloadDTO {
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursDays?: QuietHoursDayType[];
}

export interface UpdateEmailDigestPayloadDTO {
  enabled?: boolean;
  frequency?: DigestFrequencyType;
  includeActivity?: boolean;
  includeRecommendations?: boolean;
}

export interface UpdateAccountPayloadDTO {
  language?: string;
  timezone?: string;
  dateFormat?: string;
}

export type UserSettingsViewDTO = UserSettingsData;
