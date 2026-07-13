export type RecordTrackerSubtopicCompletedActivityInput = {
  userId: string;
  trackerId: string;
  topicId: string;
  subtopicId: string;

  trackerTitle: string;
  subtopicTitle: string;

  xpAwarded: number;
  utcOffsetMinutes?: number;
};

export type RecordTrackerTopicCompletedActivityInput = {
  userId: string;
  trackerId: string;
  topicId: string;

  trackerTitle: string;
  topicTitle: string;

  xpAwarded: number;
  utcOffsetMinutes?: number;
};

export type RecordTrackerCompletedActivityInput = {
  userId: string;
  trackerId: string;

  trackerTitle: string;

  xpAwarded: number;
  utcOffsetMinutes?: number;
};

export interface ITrackerActivityRecorder {
  recordSubtopicCompleted(input: RecordTrackerSubtopicCompletedActivityInput): Promise<void>;

  recordTopicCompleted(input: RecordTrackerTopicCompletedActivityInput): Promise<void>;

  recordTrackerCompleted(input: RecordTrackerCompletedActivityInput): Promise<void>;
}
