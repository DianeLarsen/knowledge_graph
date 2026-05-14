"use server";

import { createNote, updateNote } from "@/db/queries/notes";
import { getCurrentUserId } from "@/db/queries/users";
import { revalidatePath } from "next/cache";
import { addEntityToProject } from "@/db/queries/projects";

type ProjectRole = "source" | "working" | "completed" | "reference";

type CreateNoteActionInput = {
  title: string;
  content: string;
  contentJson?: string;
  selectedTagIds?: string[];
  newTagName?: string;
  linkedNoteIds?: string[];
  inlineTagNames?: string[];
  selectedReferenceIds?: string[];
  projectId?: string;
  projectRole?: ProjectRole;
};

type UpdateNoteActionInput = {
  id: string;
  title: string;
  content: string;
  contentJson: string;
  inlineTagNames?: string[];
  selectedReferenceIds?: string[];
  linkedNoteIds?: string[];
};

function revalidateNoteWorkflows(noteId?: string) {
  if (noteId) {
    revalidatePath(`/notes/${noteId}`);
    revalidatePath(`/notes/${noteId}/edit`);
  }

  revalidatePath("/notes");
  revalidatePath("/workspace");
  revalidatePath("/capture");
  revalidatePath("/tasks");
  revalidatePath("/calendar");
}

export async function updateNoteAction(input: UpdateNoteActionInput) {
  const userId = await getCurrentUserId();

  const note = await updateNote(
    input.id,
    userId,
    input.title,
    input.content,
    input.contentJson,
    input.inlineTagNames ?? [],
    input.selectedReferenceIds ?? [],
    input.linkedNoteIds ?? [],
  );

  revalidateNoteWorkflows(input.id);

  return note;
}

export async function createNoteAction(input: CreateNoteActionInput) {
  const userId = await getCurrentUserId();

  const note = await createNote({
    ...input,
    userId,
  });

  if (input.projectId && note) {
    await addEntityToProject(userId, {
      projectId: input.projectId,
      entityType: "note",
      entityId: note.id,
      projectRole: input.projectRole ?? "working",
    });

    revalidatePath(`/projects/${input.projectId}`);
    revalidatePath(`/projects/${input.projectId}/workspace`);
  }

  revalidateNoteWorkflows(note?.id);

  return note;
}
