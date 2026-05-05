"use server";

import {
  createReference,
  updateReference,
  deleteReference,
  getReferenceLinkCount,
  getReferences,
  addReferenceToNote,
  removeReferenceFromNote,
  getReferencesForNote,
} from "@/db/queries/references";
import { createEntityLink, deleteEntityLink } from "@/db/queries/entitylinks";
import { getCurrentUserId } from "@/db/queries/users";
import { revalidatePath } from "next/cache";
import { type NewReference } from "@/db/schema";

type ReferenceType =
  | "book"
  | "website"
  | "article"
  | "video"
  | "conversation"
  | "other";

type CreateReferenceActionInput = Omit<NewReference, "userId">;

function parseReferenceType(value: FormDataEntryValue | null): ReferenceType {
  if (
    value === "book" ||
    value === "website" ||
    value === "article" ||
    value === "video" ||
    value === "conversation" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

export async function createReferenceAction(input: CreateReferenceActionInput) {
  const userId = await getCurrentUserId();

  const reference = await createReference({
    ...input,
    userId,
  });

  revalidatePath("/workspace");
  revalidatePath("/notes");
  revalidatePath("/notes/references");

  return reference;
}

export async function getReferencesAction() {
  return await getReferences();
}

export async function updateReferenceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const type = parseReferenceType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !title) {
    return;
  }

  await updateReference(id, {
    type,
    title,
    author,
    url,
    notes,
  });

  revalidatePath("/notes/references");
  revalidatePath("/notes");
  revalidatePath("/workspace");
}

export async function deleteReferenceAction(referenceId: string) {
  const linkCount = await getReferenceLinkCount(referenceId);

  if (linkCount > 0) {
    return;
  }

  await deleteReference(referenceId);

  revalidatePath("/notes/references");
  revalidatePath("/notes");
  revalidatePath("/workspace");
}

export async function attachReferenceToNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "");
  const pageNumber = String(formData.get("pageNumber") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!noteId || !referenceId) {
    return;
  }

  const existingReferences = await getReferencesForNote(noteId);
  const alreadyAttached = existingReferences.some(
    (reference) => reference.id === referenceId,
  );

  if (alreadyAttached) {
    return;
  }

  await addReferenceToNote({
    noteId,
    referenceId,
    pageNumber: pageNumber || null,
    summary: summary || null,
  });

  await createEntityLink({
    userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "uses",
  });

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/workspace");
  revalidatePath("/notes/references");
}

export async function removeReferenceFromNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "");

  if (!noteId || !referenceId) {
    return;
  }

  await removeReferenceFromNote(noteId, referenceId);

  await deleteEntityLink({
    userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "uses",
  });

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/workspace");
  revalidatePath("/notes/references");
}
