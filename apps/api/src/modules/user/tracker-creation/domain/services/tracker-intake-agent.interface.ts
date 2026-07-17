export type TrackerIntakeMessage = {
  role: 'assistant' | 'user';
  content: string;
};

export type TrackerIntakeProfile = {
  topic: string;
  motivation: string;
  desiredOutcome: string;
  currentExperience: string;
  weeklyTimeCommitment: string;
  preferredLanguage: string;
  learningPreferences: string[];
  constraints: string[];
  inferredLevel: 'beginner' | 'intermediate' | 'advanced';
};

export interface ITrackerIntakeAgent {
  continueIntake(
    userId: string,
    messages: TrackerIntakeMessage[]
  ): Promise<{
    assistantMessage: string;
    isComplete: boolean;
    profile?: TrackerIntakeProfile;
  }>;
}
