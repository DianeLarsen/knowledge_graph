"use server";

import OpenAI from "openai";
import type { QuickNote } from "@/lib/types/quickTypes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ExistingProjectNoteSuggestion = {
  id: string;
  title: string;
  reason: string;
};

export async function suggestExistingNotesForCaptureProjectAction({
  captureText,
  summary,
  projectTitle,
  notes,
}: {
  captureText: string;
  summary: string;
  projectTitle: string;
  notes: QuickNote[];
}): Promise<ExistingProjectNoteSuggestion[]> {
  if (notes.length === 0) return [];

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are helping decide which existing notes should optionally be added to a new project.

Return JSON only:
{
  "suggestions": [
    {
      "id": "existing note id",
      "title": "existing note title",
      "reason": "brief reason this note belongs in the project"
    }
  ]
}

Rules:
- Only suggest notes from the provided existing notes.
- Do not invent IDs.
- Suggest only notes that are genuinely useful for the project.
- It is okay to return an empty list.
- Prefer fewer, stronger suggestions.
- Maximum 5 suggestions.
- Do not suggest a note just because it shares one generic word.
- The reason should be specific and short.

New project:
${JSON.stringify(
  {
    projectTitle,
    captureSummary: summary,
    captureText,
  },
  null,
  2,
)}

Existing notes:
${JSON.stringify(
  notes.map((note) => ({
    id: note.id,
    title: note.title,
    content: "content" in note ? note.content : undefined,
  })),
  null,
  2,
)}
`,
  });

  return parseSuggestions(response.output_text, notes);
}

function parseSuggestions(
  text: string | undefined,
  notes: QuickNote[],
): ExistingProjectNoteSuggestion[] {
  if (!text) return [];

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.suggestions)) return [];

    const validNoteIds = new Set(notes.map((note) => note.id));

    return parsed.suggestions
      .filter(
        (item: Partial<ExistingProjectNoteSuggestion>) =>
          item.id && item.title && item.reason && validNoteIds.has(item.id),
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}
