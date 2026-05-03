// ═══════════════════════════════════════════════════════════════════════════
// claudeService.js — Academic Task Planner
//
// Prompt Engineering Standard Used:
//   [SYSTEM ROLE] → [CONTEXT] → [INSTRUCTION] → [CONSTRAINTS] → [OUTPUT FORMAT]
//
// Optimised for:
//   • University-style deliverables (reports, prototypes, experiments)
//   • SMART task criteria
//   • Reliable, parseable JSON output
// ═══════════════════════════════════════════════════════════════════════════

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";


// ─────────────────────────────────────────────────────────────────────────────
// HELPER — compute planning parameters from project + member data
// ─────────────────────────────────────────────────────────────────────────────
const computePlanningParams = (project, member) => {
  const today      = new Date();
  const due        = new Date(project.dueDate);
  const rawDays    = Math.max(1, Math.round((due - today) / 86400000));

  // Add a review buffer so the last task isn't due on submission day
  const bufferDays  = rawDays < 7 ? 0 : rawDays < 14 ? 1 : 2;
  const workingDays = Math.max(3, rawDays - bufferDays);

  // Daily capacity
  const weeklyHrs  = (member.availableTime.weekdays * 5) + (member.availableTime.weekends * 2);
  const dailyAvg   = parseFloat((weeklyHrs / 7).toFixed(1));

  // Complexity multiplier (affects how much can fit in one task)
  const complexityScale = { Low: 0.5, Medium: 0.65, High: 0.8 }[project.complexity] ?? 0.65;
  const taskHourCap     = parseFloat(Math.max(1.5, dailyAvg * complexityScale).toFixed(1));

  // Task count: one meaningful task per working day, capped sensibly
  const targetTaskCount = Math.min(12, Math.max(5, workingDays));

  return {
    today:            today.toISOString().split("T")[0],
    deadline:         due.toISOString().split("T")[0],
    workingDays,
    dailyAvg,
    taskHourCap,
    targetTaskCount,
    complexityScale,
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// PROMPT 1 — Project Description
//
// Standard: ROLE → CONTEXT → INSTRUCTION → CONSTRAINTS → OUTPUT FORMAT
// ─────────────────────────────────────────────────────────────────────────────
const buildDescriptionPrompt = ({ pdfText, approach }) => `
ROLE
You are an academic project coordinator who writes concise project summaries
for university group assignments.

CONTEXT
${pdfText   ? `Assignment Brief:\n${pdfText}\n`   : "Assignment brief: not provided.\n"}
${approach  ? `Student's Plan:\n${approach}\n`    : "Student plan: not provided.\n"}

INSTRUCTION
Write a 2–3 sentence project description that clearly states:
1. What the group is building or researching (favour the student's plan over the brief when they differ).
2. The primary goal or expected academic outcome.
3. Key technologies, methods, or frameworks involved (only if explicitly mentioned).

CONSTRAINTS
- Exactly 2–3 sentences. No more, no less.
- Plain prose only — no bullet points, headings, or labels.
- Do not add disclaimers, meta-commentary, or filler phrases.
- If details are absent, make a conservative inference based on standard academic conventions.

OUTPUT FORMAT
Return only the 2–3 sentence summary. No preamble. No explanation.
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// PROMPT 2 — Academic Task Generation
//
// Standard: ROLE → CONTEXT → INSTRUCTION → RULES → OUTPUT FORMAT
// ─────────────────────────────────────────────────────────────────────────────
const buildTasksPrompt = ({
  project,
  member,
  individualPart,
  groupApproach,
  pdfText,
  today,
  deadline,
  workingDays,
  dailyAvg,
  taskHourCap,
  targetTaskCount,
}) => `
ROLE
You are a university project supervisor who breaks student assignments into
concrete, day-sized tasks. You understand academic deliverables: literature
reviews, system designs, prototypes, test reports, reflective journals,
presentations, and dissertations.

CONTEXT
Project title      : "${project.title}"
Complexity level   : "${project.complexity ?? "Medium"}"
Start date         : "${today}"
Submission deadline: "${deadline}"
Working days left  : ${workingDays}

Assignment brief:
${pdfText || "Not provided."}

Group approach:
${groupApproach || "Not provided."}

Student name       : "${member.firstName} ${member.lastName}"
Individual component: "${individualPart}"
Weekday hours/day  : ${member.availableTime.weekdays}
Weekend hours/day  : ${member.availableTime.weekends}
Average hours/day  : ${dailyAvg}
Max hours per task : ${taskHourCap}

INSTRUCTION
Break the student's individual component ("${individualPart}") into exactly
${targetTaskCount} academic tasks that together cover the full scope of that
component. The tasks should guide the student from initial research through
to a submission-ready deliverable.

TASK GENERATION RULES:
1. Generate between 8 and 19 tasks covering ONLY this student's individual component
2. Base tasks directly on the PDF content and assignment requirements
3. Each task must be specific and actionable — student knows exactly what to do
4. YouTube queries must be real specific search terms a student would actually search
5. Steps must be detailed enough to follow without further instruction

TASK ORDERING RULES (follow this sequence)
1. Background research and literature review
2. Planning, outlining, or system/experiment design  
3. Core implementation, writing, or data collection (one sub-topic per task)
4. Testing, evaluation, or critical analysis
5. Editing, formatting, and submission preparation
6. Generate more than 8 tasks

TASK SIZING RULES (non-negotiable)
- Each task must be completable in ONE focused day (≤ ${taskHourCap} hours).
- If a topic needs more than ${taskHourCap} hours, split it into two sequential tasks.
  BAD : "Write the entire literature review"
  GOOD: "Draft literature review — background theory" +
        "Draft literature review — related work and gap analysis"

STEP RULES (4–6 steps per task)
- Every step must be a specific, executable action the student can do immediately.
- Name exact files, sections, tools, databases, or artefacts to produce.
  BAD : "Research the topic"
  GOOD: "Search Google Scholar for 5 peer-reviewed papers published after 2019
         on [exact sub-topic]; save citations in references.bib"
- Academic deliverables: cite section headings, word counts, or diagram names.
- Technical deliverables: cite file paths, function names, or CLI commands.

YOUTUBE QUERY RULES (2 queries per task)
- Write queries that would find a REAL tutorial or lecture on that exact skill.
- Be specific: include the tool/concept name and a qualifier.
  BAD : "machine learning tutorial"
  GOOD: "how to write a literature review for computer science assignments"
  GOOD: "Flask REST API tutorial step by step 2024"
- Match the query to the precise skill needed in THAT task, not the project overall.

OUTPUT FORMAT
Return ONLY a valid JSON array — no markdown fences, no preamble, no explanation.

[
  {
    "title": "Action verb + deliverable (≤ 10 words)",
    "description": "2–3 sentences: what to do, why it matters for the assignment, and what the output looks like.",
    "steps": [
      "Specific executable step 1",
      "Specific executable step 2",
      "Specific executable step 3",
      "Specific executable step 4"
    ],
    "youtubeQueries": [
      "Precise search query 1",
      "Precise search query 2"
    ],
    "order": 1
  }
]

Generate exactly ${targetTaskCount} task objects. The "order" field must run
from 1 to ${targetTaskCount} with no duplicates or gaps.
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// generateProjectDescription
// ─────────────────────────────────────────────────────────────────────────────
export const generateProjectDescription = async (pdfText, approach) => {
  try {
    const prompt = buildDescriptionPrompt({ pdfText, approach });

    const completion = await groq.chat.completions.create({
      model:       MODEL,
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.2,   // Near-deterministic: summarisation task
      max_tokens:  220,
    });

    return completion.choices[0].message.content?.trim() ?? null;

  } catch (err) {
    console.error("[generateProjectDescription] Groq error:", err.message);
    return null;
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// generateTasks
// ─────────────────────────────────────────────────────────────────────────────
export const generateTasks = async ({
  pdfText,
  individualPart,
  groupApproach,
  member,
  project,
}) => {
  const params = computePlanningParams(project, member);

  const prompt = buildTasksPrompt({
    project,
    member,
    individualPart,
    groupApproach,
    pdfText,
    ...params,
  });

  try {
    const completion = await groq.chat.completions.create({
      model:       MODEL,
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.4,   // Slightly creative but stays grounded in the brief
      max_tokens:  3000,  // Enough room for up to 12 detailed tasks
    });

    const raw = completion.choices[0].message.content ?? "";
    return parseTasksJSON(raw, params.targetTaskCount);

  } catch (err) {
    console.error("[generateTasks] Groq error:", err.message);
    throw new Error(`Task generation failed: ${err.message}`);
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// parseTasksJSON — strict validation + normalisation
// ─────────────────────────────────────────────────────────────────────────────
const parseTasksJSON = (raw, expectedCount) => {
  // 1. Strip any accidental markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/```\s*$/m, "")
    .trim();

  // 2. Parse
  let tasks;
  try {
    tasks = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("[parseTasksJSON] JSON.parse failed:", parseErr.message);
    console.error("[parseTasksJSON] Raw preview:", raw.slice(0, 600));
    throw new Error(`AI returned invalid JSON: ${parseErr.message}`);
  }

  // 3. Structural guard
  if (!Array.isArray(tasks)) {
    throw new Error("AI response is not a JSON array.");
  }

  // 4. Normalise each task
  const normalised = tasks
    .filter((t) => t?.title)                     // must have a title
    .map((t, i) => ({
      title: String(t.title).trim().slice(0, 100),

      description: t.description
        ? String(t.description).trim().slice(0, 400)
        : "",

      steps: Array.isArray(t.steps)
        ? t.steps
            .map((s) => String(s).trim())
            .filter(Boolean)
            .slice(0, 6)
        : [],

      youtubeQueries: Array.isArray(t.youtubeQueries)
        ? t.youtubeQueries
            .map((q) => String(q).trim())
            .filter(Boolean)
            .slice(0, 2)
        : [],

      // Enforce order falls within expected range
      order: Math.max(1, Math.min(expectedCount, Number(t.order) || i + 1)),
    }))
    .slice(0, 12);  // hard cap

  if (normalised.length === 0) {
    throw new Error("AI returned no valid tasks after normalisation.");
  }

  return normalised;
};