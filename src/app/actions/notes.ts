"use server";

import { createNote, updateNote } from "@/db/queries/notes";
import { getCurrentUserId } from "@/db/queries/users";
import { revalidatePath } from "next/cache";

type CreateNoteActionInput = {
  title: string;
  content: string;
  contentJson?: string;
  selectedTagIds?: string[];
  newTagName?: string;
  linkedNoteIds?: string[];
  inlineTagNames?: string[];
  selectedReferenceIds?: string[];
};

type UpdateNoteActionInput = {
  id: string;
  title: string;
  content: string;
  contentJson: string;
  inlineTagNames: string[];
  selectedReferenceIds: string[];
  linkedNoteIds?: string[];
};

export async function updateNoteAction(input: UpdateNoteActionInput) {
  const userId = await getCurrentUserId();

  const note = await updateNote(
    input.id,
    userId,
    input.title,
    input.content,
    input.contentJson,
    input.inlineTagNames,
    input.selectedReferenceIds,
    input.linkedNoteIds ?? [],
  );

  revalidatePath(`/notes/${input.id}`);
  revalidatePath(`/notes/${input.id}/edit`);
  revalidatePath("/notes");
  revalidatePath("/workspace");
  revalidatePath("/capture");
  revalidatePath("/tasks");
  revalidatePath("/calendar");

  return note;
}

export async function createNoteAction(input: CreateNoteActionInput) {
  const userId = await getCurrentUserId();

  const note = await createNote({
    ...input,
    userId,
  });

  revalidatePath("/workspace");
  revalidatePath("/notes");
  revalidatePath("/capture");
  revalidatePath("/tasks");
  revalidatePath("/calendar");

  return note;
}
