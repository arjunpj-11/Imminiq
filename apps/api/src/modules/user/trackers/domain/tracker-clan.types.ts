export type TrackerClanRole = 'owner' | 'co_owner' | 'member' | 'outsider';

export type TrackerClanPerson = {
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role: Exclude<TrackerClanRole, 'outsider'>;
  joinedAt?: Date;
};

export type TrackerClanJoinRequest = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
};

export type TrackerClanRoleInvitation = {
  id: string;
  userId: string;
  role: 'co_owner' | 'owner';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  invitedBy: Omit<TrackerClanPerson, 'role' | 'joinedAt'>;
};

export type TrackerCloneSyncResult = {
  cloneTrackerId: string;
  addedTopics: number;
  updatedTopics: number;
  addedSubtopics: number;
  updatedSubtopics: number;
};

export type TrackerClanOverview = {
  trackerId: string;
  trackerTitle: string;
  trackerDescription: string;
  topicsCount: number;
  subtopicsCount: number;
  visibility: 'private' | 'public';
  role: TrackerClanRole;
  canManage: boolean;
  canTransferOwnership: boolean;
  hasPendingJoinRequest: boolean;
  personalCloneTrackerId: string | null;
  members: TrackerClanPerson[];
  joinRequests: TrackerClanJoinRequest[];
  roleInvitations: TrackerClanRoleInvitation[];
};

export type TrackerClanMessage = {
  id: string;
  trackerId: string;
  text: string;
  createdAt: Date;
  user: { userId: string; name: string; username: string; avatarUrl?: string | null };
};

export type TrackerClanChallengeStatus =
  | 'open'
  | 'pending'
  | 'active'
  | 'completed'
  | 'declined'
  | 'cancelled'
  | 'expired';

export type TrackerClanChallenge = {
  id: string;
  trackerId: string;
  challengeType: 'open' | 'direct';
  status: TrackerClanChallengeStatus;
  durationMinutes: number;
  questionCount: number;
  maxScore: number;
  challenger: Omit<TrackerClanPerson, 'role' | 'joinedAt'>;
  opponent: Omit<TrackerClanPerson, 'role' | 'joinedAt'> | null;
  challengerScore: number | null;
  opponentScore: number | null;
  winnerId: string | null;
  quitById: string | null;
  createdAt: Date;
  acceptBy: Date;
  startsAt: Date | null;
  endsAt: Date | null;
  completedAt: Date | null;
  canAccept: boolean;
  canDecline: boolean;
  canCancel: boolean;
  canQuit: boolean;
  canSubmit: boolean;
  submitted: boolean;
  totalNodes: number;
  checkpointNodes: number[];
  viewerPosition: number;
  opponentPosition: number;
  viewerScore: number;
  opponentLiveScore: number;
  questionsRemaining: number;
  pushBackPowers: number;
  checkpointDecisionRequired: boolean;
  lastAnswerCorrect: boolean | null;
  questions: Array<{
    id: string;
    prompt: string;
    options: string[];
    topicTitle: string;
    points: number;
    isCheckpoint: boolean;
  }>;
};

export type TrackerClanChallengeEvent = {
  id: string;
  trackerId: string;
  status: TrackerClanChallengeStatus;
  challengerId: string;
  opponentId: string | null;
};

export type TrackerClanChallengeQuestion = {
  prompt: string;
  options: string[];
  correctAnswer: string;
  topicTitle: string;
  points: number;
  isCheckpoint: boolean;
};

export type TrackerClanChallengeQuestionContext = {
  trackerTitle: string;
  trackerDescription: string;
  category: string;
  field: string;
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  contentLanguage: string;
  topics: Array<{
    title: string;
    description: string;
    subtopics: Array<{ title: string; description: string }>;
  }>;
};

export type TrackerClanChallengeExtensionContext = {
  context: TrackerClanChallengeQuestionContext;
  existingQuestionCount: number;
};

export type TrackerClanChallengeHistoryAnswer = {
  questionId: string;
  prompt: string;
  options: string[];
  topicTitle: string;
  answer: string;
  correctAnswer: string;
  isCorrect: boolean;
  isCheckpoint: boolean;
  positionBefore: number;
  positionAfter: number;
  answeredAt: Date;
};

export type TrackerClanChallengeHistory = {
  challengeId: string;
  trackerId: string;
  startedAt: Date | null;
  completedAt: Date;
  winnerId: string | null;
  quitById: string | null;
  players: Array<{
    user: Omit<TrackerClanPerson, 'role' | 'joinedAt'>;
    score: number;
    answers: TrackerClanChallengeHistoryAnswer[];
  }>;
};
