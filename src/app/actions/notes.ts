"use server";

import { createNote } from "@/db/queries/notes";
import { revalidatePath } from "next/cache";

type CreateNoteActionInput = {
  userId: string;
  title: string;
  content: string;
  contentJson?: string;
  selectedTagIds?: string[];
  newTagName?: string;
  linkedNoteIds?: string[];
};

export async function createNoteAction(input: CreateNoteActionInput) {
  const note = await createNote(input);

  revalidatePath("/workspace");
  revalidatePath("/notes");

  return note;
}