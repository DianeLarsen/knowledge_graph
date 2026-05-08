import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CaptureAnalysisSchema = z.object({
  summary: z.string(),
  coreIdeas: z.array(z.string()),
  possibleTasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      status: z.enum(["todo", "in_progress", "awaiting", "done"]),
    }),
  ),
  possibleNotes: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
  possibleReferences: z.array(
    z.object({
      type: z.enum([
        "book",
        "website",
        "article",
        "video",
        "conversation",
        "other",
      ]),
      title: z.string(),
      author: z.string(),
      url: z.string(),
      notes: z.string(),
    }),
  ),
  aiPrompts: z.array(z.string()),
  connections: z.array(z.string()),
  nextSteps: z.array(z.string()),
  openQuestions: z.array(z.string()),
  risks: z.array(z.string()),
});

export type CaptureAnalysis = z.infer<typeof CaptureAnalysisSchema>;

export async function analyzeCaptureText(
  rawText: string,
): Promise<CaptureAnalysis> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
You analyze messy brain dumps for a personal knowledge management and project planning app.

Your job is to extract structured thinking, not just summarize.

Return JSON with:

1. summary
- What this is actually about (1–2 sentences)

2. coreIdeas
- Key insights worth keeping
- One idea per item (atomic)

3. possibleNotes
- Turn ideas into reusable notes
- Each must stand alone and be useful later

4. possibleTasks
- Only actionable items
- Include: title, description, priority (low/medium/high), status (todo)

5. possibleReferences
- Extract user-provided sources if present
- Otherwise suggest high-quality resources (official docs, well-known sources)
- Do NOT fabricate sources
- If unsure of URL, leave blank and explain what to search in notes

6. aiPrompts
- Useful prompts the user could run next to deepen, organize, or execute the idea

7. connections
- What this relates to: skills, systems, projects, concepts, or existing knowledge areas

8. risks
- Weak thinking, confusion, or likely failure points

9. nextSteps
- Small, concrete, executable actions

10. openQuestions
- What is unclear or needs validation

Rules:
- No fluff or repetition
- Prefer specific over complete
- Call out uncertainty instead of guessing
- Notes must be atomic and reusable
- References must be credible
- Always return arrays, even when empty
`.trim(),
      },
      {
        role: "user",
        content: rawText,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "capture_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "summary",
            "coreIdeas",
            "possibleTasks",
            "possibleNotes",
            "possibleReferences",
            "aiPrompts",
            "connections",
            "nextSteps",
            "openQuestions",
            "risks",
          ],
          properties: {
            summary: { type: "string" },
            coreIdeas: {
              type: "array",
              items: { type: "string" },
            },
            possibleTasks: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "description", "priority", "status"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                  },
                  status: {
                    type: "string",
                    enum: ["todo", "in_progress", "awaiting", "done"],
                  },
                },
              },
            },
            possibleNotes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["title", "content"],
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                },
              },
            },
            possibleReferences: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["type", "title", "author", "url", "notes"],
                properties: {
                  type: {
                    type: "string",
                    enum: [
                      "book",
                      "website",
                      "article",
                      "video",
                      "conversation",
                      "other",
                    ],
                  },
                  title: { type: "string" },
                  author: { type: "string" },
                  url: { type: "string" },
                  notes: { type: "string" },
                },
              },
            },
            aiPrompts: {
              type: "array",
              items: { type: "string" },
            },
            connections: {
              type: "array",
              items: { type: "string" },
            },
            nextSteps: {
              type: "array",
              items: { type: "string" },
            },
            openQuestions: {
              type: "array",
              items: { type: "string" },
            },
            risks: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  });

  const text = response.output_text;
  const parsed = JSON.parse(text);

  return CaptureAnalysisSchema.parse(parsed);
}


