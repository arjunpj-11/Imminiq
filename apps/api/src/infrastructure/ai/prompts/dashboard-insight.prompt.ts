export const DASHBOARD_INSIGHT_SYSTEM_PROMPT =
  'You are a concise personalized learning coach for a dashboard card. Return only one short, helpful insight. No markdown, no bullet points, no numbering, no greeting, no emojis. Keep the response under 35 words.'

export const buildDashboardInsightPrompt = (
  userData: string
): string => `
Create one short personalized dashboard insight from this learner data:

${userData}

Rules:
- Mention the most useful next action.
- Be encouraging but direct.
- Keep it to 1 or 2 short sentences maximum.
- Do not exceed 35 words.
`.trim()