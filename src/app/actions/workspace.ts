"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/db/queries/users";
import { addEntityToProject, createProject } from "@/db/queries/projects";
import type { NewProjectItem } from "@/db/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getProjectRole(formData: FormData): NewProjectItem["projectRole"] {
  const value = getString(formData, "projectRole");

  if (
    value === "source" ||
    value === "working" ||
    value === "completed" ||
    value === "reference"
  ) {
    return value;
  }

  return "working";
}

export async function saveWorkspaceToProjectAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const existingProjectId = getString(formData, "projectId");
  const newProjectTitle = getString(formData, "newProjectTitle");
  const projectRole = getProjectRole(formData);

  const noteIds = formData
    .getAll("noteId")
    .map((value) => String(value))
    .filter(Boolean);

  if (noteIds.length === 0) {
    throw new Error("No open notes selected.");
  }

  let projectId = existingProjectId;

  if (!projectId) {
    if (!newProjectTitle) {
      throw new Error("Choose a project or enter a new project name.");
    }

    const project = await createProject({
      userId,
      title: newProjectTitle,
      description: "Created from workspace",
      visibility: "private",
      status: "active",
    });

    if (!project) {
      throw new Error("Project could not be created.");
    }

    projectId = project.id;
  }

  await Promise.all(
    noteIds.map((noteId) =>
      addEntityToProject({
        userId,
        projectId,
        entityType: "note",
        entityId: noteId,
        projectRole,
      }),
    ),
  );

  revalidatePath("/workspace");
  revalidatePath("/projects");
}

export async function suggestWorkspaceProjectTitleAction(formData: FormData) {
  const notes = formData
    .getAll("note")
    .map((value) => String(value))
    .filter(Boolean);

  if (notes.length === 0) {
    return "Workspace Project";
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Create a concise project title based on a group of notes. Return only the title. No quotes. No explanation. Keep it under 7 words.",
      },
      {
        role: "user",
        content: notes.join("\n\n---\n\n"),
      },
    ],
  });

  return response.output_text.trim() || "Workspace Project";
}