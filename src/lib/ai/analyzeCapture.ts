import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CaptureAnalysisSchema = z.object({
  summary: z.string(),
  possibleTasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      status: z.enum(["new", "in_progress", "awaiting", "done"]),
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
        content:
          "You analyze messy brain dumps for a personal knowledge management and project planning app. Extract concrete tasks, possible notes, possible references, useful AI prompts, next steps, open questions, and risks. Do not invent specific references. If reference details are missing, use empty strings. Return only structured data.",
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
            "possibleTasks",
            "possibleNotes",
            "possibleReferences",
            "aiPrompts",
            "nextSteps",
            "openQuestions",
            "risks",
          ],
          properties: {
            summary: { type: "string" },
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
                    enum: ["new", "in_progress", "awaiting", "done"],
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
