"use server";

import OpenAI from "openai";
import { Tag } from "@/db/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type SuggestedTagResult = {
  existingTagNames: string[];
  newTagNames: string[];
};

export async function suggestTagsForNoteAction({
  title,
  content,
  availableTags,
}: {
  title: string;
  content: string;
  availableTags: Pick<Tag, "name">[];
}): Promise<SuggestedTagResult> {
  const tagNames = availableTags.map((tag) => tag.name);

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `
Suggest useful tags for this note.

Return JSON only:
{
  "existingTagNames": [],
  "newTagNames": []
}

Rules:
- Return JSON only.
- Tags must be lowercase.
- Tags must not include hashtags.
- Tags must be one word.
- If a concept needs two words, use snake_case, like health_equity.
- Prefer 1-word tags when possible.
- Avoid tags that are too broad, like note, idea, important, misc, project, general.
- Avoid tags that are too specific, like exact book titles, full task names, dates, or one-off phrases.
- Good tags should be reusable across several notes, but not so vague they apply to everything.
- Use existingTagNames only if the tag already exists.
- Use newTagNames only for useful reusable tags that do not exist yet.
- Maximum 5 existing tags.
- Maximum 3 new tags.

Existing tags:
${tagNames.join(", ")}

Title:
${title}

Content:
${content}
`,
  });

  const text = response.output_text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      existingTagNames: [],
      newTagNames: [],
    };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      existingTagNames: [],
      newTagNames: [],
    };
  }
}
