"use server";

import {
  createUserReference,
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

type CreateReferenceActionInput = Omit<
  NewReference,
  "createdByUserId" | "ownerType" | "ownerId" | "visibility"
>;

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

function revalidateReferenceWorkflows(noteId?: string) {
  revalidatePath("/workspace");
  revalidatePath("/notes");
  revalidatePath("/notes/references");

  if (noteId) {
    revalidatePath(`/notes/${noteId}`);
  }
}

export async function createReferenceAction(input: CreateReferenceActionInput) {
  const userId = await getCurrentUserId();

  const reference = await createUserReference(userId, input);

  revalidateReferenceWorkflows();

  return reference;
}

export async function getReferencesAction() {
  const userId = await getCurrentUserId();
  return getReferences(userId);
}

export async function updateReferenceAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const id = String(formData.get("id") ?? "");
  const type = parseReferenceType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!id || !title) {
    return null;
  }

  const reference = await updateReference(id, userId, {
    type,
    title,
    author,
    url,
    notes,
  });

  revalidateReferenceWorkflows();

  return reference;
}

export async function deleteReferenceAction(referenceId: string) {
  const userId = await getCurrentUserId();

  const linkCount = await getReferenceLinkCount(referenceId);

  if (linkCount > 0) {
    return null;
  }

  const deleted = await deleteReference(referenceId, userId);

  revalidateReferenceWorkflows();

  return deleted;
}

export async function attachReferenceToNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "");
  const pageNumber = String(formData.get("pageNumber") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!noteId || !referenceId) {
    return null;
  }

  const existingReferences = await getReferencesForNote(userId, noteId);
  const alreadyAttached = existingReferences.some(
    (reference) => reference.id === referenceId,
  );

  if (alreadyAttached) {
    return null;
  }

  const noteReference = await addReferenceToNote({
    noteId,
    referenceId,
    pageNumber: pageNumber || null,
    summary: summary || null,
  });

  await createEntityLink({
    createdByUserId: userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "uses",
  });

  revalidateReferenceWorkflows(noteId);

  return noteReference;
}

export async function removeReferenceFromNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "");

  if (!noteId || !referenceId) {
    return null;
  }

  const removed = await removeReferenceFromNote(noteId, referenceId);

  await deleteEntityLink({
    userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "uses",
  });

  revalidateReferenceWorkflows(noteId);

  return removed;
}

export async function getReferencesForNoteAction(noteId: string) {
  const userId = await getCurrentUserId();
  return getReferencesForNote(userId, noteId);
}
