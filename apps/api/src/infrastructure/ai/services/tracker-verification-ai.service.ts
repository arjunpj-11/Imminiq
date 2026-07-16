import {
  trackerSubtopicVerificationSchema,
  trackerTopicVerificationSchema,
  type TrackerSubtopicVerificationResult,
  type TrackerTopicVerificationResult,
} from '../ai.schemas';
import { parseAIJson } from '../ai-json.parser';
import { economyAIStructuredWithFallback } from '../ai-fallback.helper';
import {
  buildTrackerSubtopicVerificationPrompt,
  TRACKER_SUBTOPIC_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/tracker-subtopic-verification.prompt';
import {
  buildTrackerTopicVerificationPrompt,
  TRACKER_TOPIC_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/tracker-topic-verification.prompt';

// ============================================================
// GROQ — TRACKER TOPIC / SUBTOPIC VERIFICATION
// ============================================================

export const verifyTrackerTopic = async (input: {
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  existingTopics: {
    id: string;
    title: string;
    description: string;
  }[];
}): Promise<TrackerTopicVerificationResult> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: TRACKER_TOPIC_VERIFICATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildTrackerTopicVerificationPrompt(input),
      },
    ],
    (response) => parseAIJson(response, trackerTopicVerificationSchema),
    'quality',
    'tracker_verification',
    { operation: 'tracker-topic-verification', temperature: 0.2 }
  );
};

export const verifyTrackerSubtopic = async (input: {
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  subtopicTitle: string;
  subtopicDescription: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  existingSubtopics: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  }[];
}): Promise<TrackerSubtopicVerificationResult> => {
  return economyAIStructuredWithFallback(
    [
      {
        role: 'system',
        content: TRACKER_SUBTOPIC_VERIFICATION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: buildTrackerSubtopicVerificationPrompt(input),
      },
    ],
    (response) => parseAIJson(response, trackerSubtopicVerificationSchema),
    'quality',
    'tracker_verification',
    { operation: 'tracker-subtopic-verification', temperature: 0.2 }
  );
};
