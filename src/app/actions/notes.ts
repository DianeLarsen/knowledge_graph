"use server";

import { createNote, updateNote } from "@/db/queries/notes";
import { revalidatePath } from "next/cache";

type CreateNoteActionInput = {
  userId: string;
  title: string;
  content: string;
  contentJson?: string;
  selectedTagIds?: string[];
  newTagName?: string;
    linkedNoteIds?: string[];
  inlineTagNames?: string[];
};

type UpdateNoteActionInput = {
  id: string;
  title: string;
  content: string;
  contentJson?: string;
  inlineTagNames?: string[];
};

export async function updateNoteAction(input: UpdateNoteActionInput) {
  const note = await updateNote(
    input.id,
    input.title,
    input.content,
    input.contentJson,
    input.inlineTagNames,
  );

  revalidatePath(`/notes/${input.id}`);
  revalidatePath(`/notes/${input.id}/edit`);
  revalidatePath("/notes");
  revalidatePath("/workspace");

  return note;
}

export async function createNoteAction(input: CreateNoteActionInput) {
  const note = await createNote(input);

  revalidatePath("/workspace");
  revalidatePath("/notes");

  return note;
}