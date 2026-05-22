"use server";

import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/db/queries/users";
import { createNote } from "@/db/queries/notes";
import { createUserTask } from "@/db/queries/tasks";
import { addEntityToProject } from "@/db/queries/projects";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type StarterTask = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
};

type StarterNote = {
  title: string;
  content: string;
};

type StarterSuggestions = {
  tasks: StarterTask[];
  notes: StarterNote[];
};

export async function suggestProjectStarterAction({
  projectTitle,
  projectDescription,
}: {
  projectTitle: string;
  projectDescription?: string;
}): Promise<StarterSuggestions> {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are helping create a practical starter plan for a project.

Return JSON only:
{
  "tasks": [
    {
      "title": "short action title",
      "description": "brief useful description",
      "priority": "low" | "medium" | "high"
    }
  ],
  "notes": [
    {
      "title": "planning note title",
      "content": "short useful planning note"
    }
  ]
}

Project:
${JSON.stringify(
  {
    title: projectTitle,
    description: projectDescription ?? "",
  },
  null,
  2,
)}

Rules:
- Suggest practical starter items only.
- Tasks must be concrete actions and start with a verb.
- Notes should be useful planning/reference notes, not duplicate tasks.
- For a physical cleanup or organization project, organize tasks by area or zone.
- Prefer 5 to 10 tasks.
- Suggest 1 to 3 notes.
- Do not create vague tasks like "Get started" or "Make a plan."
- Keep titles short.
`,
  });

  return parseStarterSuggestions(response.output_text);
}

export async function createProjectStarterItemsAction({
  projectId,
  tasks,
  notes,
}: {
  projectId: string;
  tasks: StarterTask[];
  notes: StarterNote[];
}) {
  const userId = await getCurrentUserId();

  for (const task of tasks) {
    const createdTask = await createUserTask(userId, {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      status: "todo",
    });

    await addEntityToProject({
      userId,
      projectId,
      entityType: "task",
      entityId: createdTask.id,
      projectRole: "working",
    });
  }

  for (const note of notes) {
    const createdNote = await createNote({
      userId,
      title: note.title,
      content: note.content,
      contentJson: makePlainTextContentJson(note.content),
    });

    await addEntityToProject({
      userId,
      projectId,
      entityType: "note",
      entityId: createdNote.id,
      projectRole: "working",
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/notes");

  return {
    createdTasks: tasks.length,
    createdNotes: notes.length,
  };
}

function parseStarterSuggestions(text?: string): StarterSuggestions {
  if (!text) {
    return {
      tasks: [],
      notes: [],
    };
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return {
      tasks: [],
      notes: [],
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      tasks: Array.isArray(parsed.tasks)
        ? parsed.tasks
            .filter((task: Partial<StarterTask>) => task.title)
            .slice(0, 10)
        : [],
      notes: Array.isArray(parsed.notes)
        ? parsed.notes
            .filter((note: Partial<StarterNote>) => note.title && note.content)
            .slice(0, 3)
        : [],
    };
  } catch {
    return {
      tasks: [],
      notes: [],
    };
  }
}

function makePlainTextContentJson(content: string) {
  const paragraphs = content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraph,
        },
      ],
    }));

  return JSON.stringify({
    type: "doc",
    content:
      paragraphs.length > 0
        ? paragraphs
        : [
            {
              type: "paragraph",
            },
          ],
  });
}
