export const TRACKER_SUBTOPIC_VERIFICATION_SYSTEM_PROMPT =
  'You are a strict curriculum reviewer for Imminiq. Return only strict valid JSON. No markdown. No extra explanation.';

export const buildTrackerSubtopicVerificationPrompt = (input: {
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
}): string => {
  const existingList = input.existingSubtopics.length
    ? input.existingSubtopics
        .map(
          (subtopic, index) =>
            `${index + 1}. ${subtopic.title}${
              subtopic.difficulty ? ` [${subtopic.difficulty}]` : ''
            }${subtopic.description ? ` — ${subtopic.description}` : ''}`
        )
        .join('\n')
    : 'None yet';

  return `
A user wants to add a new subtopic (lesson) under a topic in their learning tracker.

Tracker title:
${input.trackerTitle}

Parent topic:
${input.topicTitle}${input.topicDescription ? ` — ${input.topicDescription}` : ''}

New subtopic title:
${input.subtopicTitle}

New subtopic description:
${input.subtopicDescription || 'Not provided'}

Difficulty:
${input.difficulty}

Existing subtopics already under this topic:
${existingList}

Your task:
- Decide whether this new subtopic genuinely belongs under this specific topic.
- Reject it if it is off-topic for the parent topic, too vague, a clear duplicate of an existing subtopic, or does not add learning value.
- Approve it if it is a relevant, distinct, and meaningful lesson that fits logically under the parent topic.
- Be practical: minor wording differences from existing subtopics are fine if the learning content is clearly distinct.

Return ONLY valid JSON using this exact structure:

{
  "verified": true,
  "message": "Short explanation of why this subtopic was approved or rejected.",
  "polishedTitle": "Fix obvious typos only. Otherwise return the title exactly as given.",
  "polishedDescription": "One clear sentence describing what the learner will understand or practice in this subtopic."
}
`.trim();
};
