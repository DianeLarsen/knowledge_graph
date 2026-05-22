"use server";

import OpenAI from "openai";
import type { EntityType } from "@/db/schema";
import type {
  QuickCreateSuggestion,
  QuickLinkSuggestion,
} from "@/lib/types/quickSuggestions";
import type {
  QuickNote,
  QuickReference,
  QuickTask,
  QuickEvent,
} from "@/lib/types/quickTypes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function suggestQuickCreatesAction({
  entityType,
  sourceTitle,
  sourceContent,
}: {
  entityType: EntityType;
  sourceTitle?: string;
  sourceContent?: string;
}): Promise<QuickCreateSuggestion[]> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are helping suggest practical quick actions for a personal knowledge system.

Return JSON only:
{
  "suggestions": [
    {
      "type": "task" | "note" | "event" | "capture",
      "title": "short useful title",
      "reason": "brief reason"
    }
  ]
}

Source item:
- Type: ${entityType}
- Title: ${sourceTitle || "Untitled"}
- Content: ${sourceContent || "No content provided"}

Rules:
- Suggest only actions that naturally follow from the source.
- Do not suggest generic actions like "Review this note" unless the source clearly needs review.
- Task suggestions should start with a verb.
- Note suggestions should sound like reusable knowledge notes, not chores.
- Event suggestions should only be included if the source implies a date, appointment, deadline, meeting, or scheduled follow-up.
- Capture suggestions should only be included if there is a loose idea worth saving separately.
- Suggest 2 to 5 total items.
- Prefer fewer, better suggestions.
- Titles should be short and specific.
`,
  });

  return parseSuggestions<QuickCreateSuggestion>(response.output_text);
}

export async function suggestQuickLinksAction({
  entityType,
  entityId,
  sourceTitle,
  sourceContent,
  notes,
  references,
  tasks,
  events,
  linkedNoteIds,
  linkedReferenceIds,
  linkedTaskIds,
  linkedEventIds,
}: {
  entityType: EntityType;
  entityId: string;
  sourceTitle?: string;
  sourceContent?: string;
  notes: QuickNote[];
  references: QuickReference[];
  tasks: QuickTask[];
  events: QuickEvent[];
  linkedNoteIds: string[];
  linkedReferenceIds: string[];
  linkedTaskIds: string[];
  linkedEventIds: string[];
}): Promise<QuickLinkSuggestion[]> {
  const availableNotes = notes.filter(
    (note) =>
      !(entityType === "note" && note.id === entityId) &&
      !linkedNoteIds.includes(note.id),
  );

  const availableReferences = references.filter(
    (reference) =>
      !(entityType === "reference" && reference.id === entityId) &&
      !linkedReferenceIds.includes(reference.id),
  );

  const availableTasks = tasks.filter(
    (task) =>
      !(entityType === "task" && task.id === entityId) &&
      !linkedTaskIds.includes(task.id),
  );

  const availableEvents = events.filter(
    (event) =>
      !(entityType === "event" && event.id === entityId) &&
      !linkedEventIds.includes(event.id),
  );

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `
Suggest existing items that should be linked to this item.

Return JSON only:
{
  "suggestions": [
    {
      "type": "note" | "reference" | "task" | "event",
      "id": "existing item id",
      "title": "existing item title",
      "reason": "brief reason"
    }
  ]
}

Rules:
- Only suggest items from the provided available items.
- Do not invent ids.
- Suggest 3 to 8 links.
- Prefer items that are clearly related.
- Avoid weak or vague matches.

Source item:
${JSON.stringify(
  {
    entityType,
    entityId,
    title: sourceTitle,
    content: sourceContent,
  },
  null,
  2,
)}

Available notes:
${JSON.stringify(
  availableNotes.map((note) => ({
    id: note.id,
    title: note.title,
    content: "content" in note ? note.content : undefined,
  })),
)}

Available references:
${JSON.stringify(
  availableReferences.map((reference) => ({
    id: reference.id,
    title: reference.title,
    author: "author" in reference ? reference.author : undefined,
    notes: "notes" in reference ? reference.notes : undefined,
  })),
)}

Available tasks:
${JSON.stringify(
  availableTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: "description" in task ? task.description : undefined,
  })),
)}

Available events:
${JSON.stringify(
  availableEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: "description" in event ? event.description : undefined,
  })),
)}`,
  });

  return parseSuggestions<QuickLinkSuggestion>(response.output_text);
}

function cleanSuggestionTitle(title: string) {
  return title.trim().replace(/\s+/g, " ");
}

type SuggestionLike = {
  title?: unknown;
  [key: string]: unknown;
};

function isSuggestionLike(value: unknown): value is SuggestionLike {
  return typeof value === "object" && value !== null;
}

function parseSuggestions<T>(text?: string): T[] {
  if (!text) return [];

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      suggestions?: unknown;
    };

    if (!Array.isArray(parsed.suggestions)) return [];

    return parsed.suggestions
      .filter(isSuggestionLike)
      .filter((item) => typeof item.title === "string")
      .map((item) => ({
        ...item,
        title: cleanSuggestionTitle(item.title as string),
      }))
      .filter((item) => item.title.length >= 4) as T[];
  } catch {
    return [];
  }
}
