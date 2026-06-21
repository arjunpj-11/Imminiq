export const ROADMAP_EVALUATION_SYSTEM_PROMPT =
  'You are a strict roadmap evaluator. Return strict valid JSON only.'

export const buildRoadmapEvaluationPrompt = (
  roadmap: unknown
): string => `
You are a strict expert curriculum evaluator, interview mentor, and learning-path reviewer.

Your task is to critically evaluate this AI-generated roadmap.

The roadmap must be judged as a COMPLETE ZERO-TO-HERO MASTER ROADMAP.

============================================================
ROADMAP TO EVALUATE
============================================================

${JSON.stringify(roadmap, null, 2)}

============================================================
SCORING RULES
============================================================

Score from 0 to 100.

Be strict:
- 90–100: truly excellent, very detailed, highly complete, strongly interview-ready
- 75–89: strong roadmap, but some meaningful improvements are still possible
- 60–74: usable, but incomplete or not detailed enough in several areas
- 40–59: weak, too shallow, or significantly missing major coverage
- 0–39: poor, highly incomplete, or unsuitable as a zero-to-hero roadmap

Lower the score when:
- the roadmap is shallow
- the roadmap is not genuinely zero-to-hero
- advanced depth is lacking
- topic sequencing is weak
- interview preparation is weak where expected
- practical projects, implementation tasks, or applied learning are missing
- testing, debugging, performance, security, deployment, or architecture are missing where relevant
- roadmap nodes are too vague
- roadmap does not have enough concrete checklist-style items

============================================================
GRADE RULES
============================================================

Assign grade exactly as:
- 0 to 39 = "Poor"
- 40 to 59 = "Fair"
- 60 to 74 = "Good"
- 75 to 89 = "Very Good"
- 90 to 100 = "Excellent"

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.
No markdown.
No comments.
No explanation before or after JSON.

Use this exact JSON structure:

{
  "score": 0,
  "grade": "Poor",
  "summary": "A clear overall evaluation of the roadmap quality, completeness, and interview-readiness.",
  "missingTopics": [
    {
      "title": "Exact topic that should be added",
      "description": "Short checklist-ready description for this missing topic.",
      "reason": "Why this topic is important and why it is considered missing.",
      "suggestedParentTitle": "The most suitable existing roadmap section or topic title where this should be added."
    }
  ]
}

Final checks:
- JSON must be valid.
- score must be an integer from 0 to 100.
- grade must exactly match the score range.
- summary must explain the overall quality clearly.
- missingTopics should contain only genuinely useful additions.
- Each missing topic must be concrete enough to insert directly into the tracker.
- suggestedParentTitle must match or closely reference the best existing roadmap topic or section title.
- If the roadmap is already extremely complete, missingTopics may be an empty array.
`