import type { VisualizationInput } from '../ai.schemas'

export const LESSON_VISUALIZATION_SYSTEM_PROMPT =
  'You are an expert educational visualization engineer. Return only a complete self-contained HTML file starting with <!DOCTYPE html>. No markdown, no explanation, no code fences.'

export const buildVisualizationPrompt = (
  lesson: VisualizationInput
): string => {
  const truncatedExplanation = lesson.explanation.slice(0, 2000)
  const codeSnippet = lesson.codeExample?.code
    ? `\nCode Example (${lesson.codeExample.language}):\n${lesson.codeExample.code.slice(0, 500)}`
    : ''

  return `You are an expert educational animator. Your job is to create a self-contained interactive HTML canvas visualization that teaches ONE specific concept through clear, step-by-step visual flow.

════════════════════════════════════════
LESSON TO VISUALIZE
════════════════════════════════════════
Title: ${lesson.title}
Type: ${lesson.lessonType}
Difficulty: ${lesson.difficulty}
Tags: ${lesson.tags.join(', ')}
Summary: ${lesson.summary}
${codeSnippet}

Explanation:
${truncatedExplanation}

════════════════════════════════════════
CRITICAL RULE — READ FIRST
════════════════════════════════════════
You must visualize THE EXACT NAMED CONCEPT in the lesson title above.

DO NOT generate:
- Generic floating nodes labeled "data" or "node"
- Random particle systems
- Abstract graph networks with no meaning
- Placeholder boxes with no labels

You MUST generate a visualization that a student could pause on and say
"I now understand ${lesson.title}" — not just "I saw a pretty animation."

════════════════════════════════════════
HOW TO PICK THE RIGHT VISUALIZATION
════════════════════════════════════════
Read the lesson title and tags, then choose the most educational format:

FLOW / PROCESS concepts (DNS, HTTP, OAuth, TCP, auth flows, event loop, garbage collection, etc.)
→ Draw labeled BOXES connected by animated ARROWS showing each step in sequence.
→ Animate the flow from left-to-right or top-to-bottom one step at a time.
→ Label every box and every arrow clearly. Show state changes.
→ Example for DNS: Browser → Recursive Resolver → Root NS → TLD NS → Authoritative NS → IP returned
→ Example for HTTP: Client → [GET /path] → Server → [200 OK + body] → Client

SORTING / SEARCHING algorithms (bubble sort, quicksort, binary search, etc.)
→ Draw an array of labeled bars or blocks.
→ Animate comparisons (highlight in yellow), swaps (swap with motion), and final sorted state (green).
→ Show step counter, comparisons counter, and current operation as text on canvas.

DATA STRUCTURES (linked list, tree, stack, queue, hash table, graph, heap, etc.)
→ Draw the actual structure with labeled nodes and edges.
→ Animate INSERT, DELETE, SEARCH operations visually with highlighted steps.
→ Show pointers as arrows. Show null as a ∅ symbol.

RECURSION / CALL STACK
→ Draw stack frames appearing from the bottom, stacking up, then resolving back down.
→ Label each frame with the function name and current argument value.
→ Show the return value bubbling back up.

MEMORY / POINTERS / REFERENCES
→ Draw a memory layout with address blocks (e.g. 0x001, 0x002...).
→ Show variables pointing to addresses with arrows.
→ Animate allocation, assignment, and deallocation.

OS CONCEPTS (scheduling, paging, threading, semaphores, etc.)
→ Draw the components (CPU, queue, memory pages, processes) as labeled rectangles.
→ Animate transitions: ready → running → waiting → terminated with arrows and timelines.

MATH / ALGORITHMS (Big-O, Fourier, probability, sorting complexity, etc.)
→ Plot a clean graph with labeled axes.
→ Draw multiple curves in different colors (e.g. O(n), O(n²), O(log n)).
→ Animate a moving point showing growth.

DESIGN PATTERNS / ARCHITECTURE (MVC, observer, factory, microservices, etc.)
→ Draw the components as labeled boxes.
→ Animate messages or data flowing between components with labeled arrows.
→ Show a concrete example of the pattern in action (e.g. user clicks → controller → model → view).

DATABASE CONCEPTS (indexing, joins, transactions, ACID, etc.)
→ Draw tables as grids with real sample data (not "data1", "data2").
→ Animate the operation: highlight rows being joined, index pointer jumping to row, transaction locking.

════════════════════════════════════════
LABEL QUALITY RULES
════════════════════════════════════════
- Every box, node, arrow, and step MUST have a real descriptive label — never "data", "node", "item", "value" alone.
- Use actual terminology from the lesson: e.g. "Recursive Resolver", "Hash Bucket 3", "Stack Frame: fib(3)", "Page Table Entry".
- Numbers shown on canvas must mean something (not random).
- Show a step title at the top or side that describes what is currently happening: e.g. "Step 2: Root NS returns TLD server address".

════════════════════════════════════════
ANIMATION RULES
════════════════════════════════════════
- Use requestAnimationFrame. Target 60fps.
- Animate one logical step at a time with a pause between steps so the user can follow.
- After the last step, loop back to the beginning with a brief "Restarting..." pause.
- Highlight the active element in a bright accent color (yellow or white).
- Completed elements should turn a calm color (green or teal).
- Pending elements should be dim (grey or dark).

════════════════════════════════════════
CONTROLS
════════════════════════════════════════
Add a fixed overlay panel at bottom-left with:
- A speed slider (label: "Speed") that controls animation step duration.
- One additional control relevant to the concept (e.g. array size for sorting, number of processes for scheduling, node count for trees).
- Style: dark semi-transparent background (#111 / 0.85 opacity), rounded corners, white labels, colored slider track.

════════════════════════════════════════
VISUAL STYLE
════════════════════════════════════════
- Background: #0a0a0a
- Font: monospace throughout — labels, stats, titles
- Color palette: pick ONE accent color family matching the concept:
    networking/HTTP → cyan (#00bcd4 family)
    algorithms/sorting → green (#4caf50 family)
    memory/systems → orange (#ff9800 family)
    math/recursion → purple (#9c27b0 family)
    databases → blue (#2196f3 family)
    design patterns → pink (#e91e63 family)
- Canvas: 100vw × 100vh, resize on window resize
- Top-left label: "⬢ ${lesson.title}" in small monospace text, faded

════════════════════════════════════════
OUTPUT RULES
- Return ONE completely self-contained HTML file.
- No external libraries, no CDN imports. Vanilla JS only.
- Begin the response with <!DOCTYPE html> — nothing before it.
- No markdown fences, no explanation, no comments outside the HTML.`
}