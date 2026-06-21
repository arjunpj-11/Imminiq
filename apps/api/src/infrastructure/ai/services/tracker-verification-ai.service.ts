import { ApiError } from '../../../shared/utils/ApiError'

import {
  trackerSubtopicVerificationSchema,
  trackerTopicVerificationSchema,
  type TrackerSubtopicVerificationResult,
  type TrackerTopicVerificationResult,
} from '../ai.schemas'
import { parseAIJson } from '../ai-json.parser'
import { groqChat } from '../clients/groq.client'
import {
  buildTrackerSubtopicVerificationPrompt,
  TRACKER_SUBTOPIC_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/tracker-subtopic-verification.prompt'
import {
  buildTrackerTopicVerificationPrompt,
  TRACKER_TOPIC_VERIFICATION_SYSTEM_PROMPT,
} from '../prompts/tracker-topic-verification.prompt'

// ============================================================
// GROQ — TRACKER TOPIC / SUBTOPIC VERIFICATION
// ============================================================

export const verifyTrackerTopic = async (input: {
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  existingTopics: {
    id: string
    title: string
    description: string
  }[]
}): Promise<TrackerTopicVerificationResult> => {
  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty topic verification response',
      'GROQ_EMPTY_TOPIC_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, trackerTopicVerificationSchema)
}

export const verifyTrackerSubtopic = async (input: {
  trackerTitle: string
  topicTitle: string
  topicDescription: string
  subtopicTitle: string
  subtopicDescription: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  existingSubtopics: {
    id: string
    title: string
    description: string
    difficulty: string
  }[]
}): Promise<TrackerSubtopicVerificationResult> => {
  const response = await groqChat(
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
    'llama-3.3-70b-versatile'
  )

  if (!response) {
    throw new ApiError(
      502,
      'Groq returned an empty subtopic verification response',
      'GROQ_EMPTY_SUBTOPIC_VERIFICATION_RESPONSE'
    )
  }

  return parseAIJson(response, trackerSubtopicVerificationSchema)
}