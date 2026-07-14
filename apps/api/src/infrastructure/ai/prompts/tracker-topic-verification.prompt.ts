export const TRACKER_TOPIC_VERIFICATION_SYSTEM_PROMPT =
  'You are a strict curriculum reviewer for Imminiq. Return only strict valid JSON. No markdown. No extra explanation.';

export const buildTrackerTopicVerificationPrompt = (input: {
  trackerTitle: string;
  topicTitle: string;
  topicDescription: string;
  existingTopics: {
    id: string;
    title: string;
    description: string;
  }[];
}): string => {
  const existingList = input.existingTopics.length
    ? input.existingTopics
        .map(
          (topic, index) =>
            `${index + 1}. ${topic.title}${topic.description ? ` — ${topic.description}` : ''}`
        )
        .join('\n')
    : 'None yet';

  return `
A user wants to add a new topic to their learning tracker.

Tracker title:
${input.trackerTitle}

New topic title:
${input.topicTitle}

New topic description:
${input.topicDescription || 'Not provided'}

Existing topics already in this tracker:
${existingList}

Your task:
- Decide whether this new topic genuinely belongs in this tracker.
- Reject it if it is off-topic, too vague, completely duplicate, or clearly does not fit the tracker's subject.
- Approve it if it is a relevant, meaningful topic that adds value to this learning roadmap.
- Be practical: slight overlaps are fine as long as the new topic has its own distinct value.

Return ONLY valid JSON using this exact structure:

{
  "verified": true,
  "message": "Short explanation of why this topic was approved or rejected.",
  "polishedTitle": "Fix obvious typos only (e.g. 'Javascrpt' → 'JavaScript'). Otherwise return the title exactly as given.",
  "polishedDescription": "One clear sentence describing what the learner will cover. If user left it empty, write one based on the title and tracker context."
}
`.trim();
};
