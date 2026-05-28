"use server";

import {
  createUserReference,
  updateReference,
  deleteReference,
  getReferenceEntityLinkCount,
  getReferences,
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
  revalidatePath("/references");

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
  const publisher = String(formData.get("publisher") ?? "").trim();
  const publishedDate = String(formData.get("publishedDate") ?? "").trim();
  const citation = String(formData.get("citation") ?? "").trim();

  if (!id || !title) {
    return null;
  }

const reference = await updateReference(id, userId, {
  type,
  title,
  author: author || null,
  url: url || null,
  publisher: publisher || null,
  publishedDate: publishedDate || null,
  citation: citation || null,
  notes: notes || null,
});

  revalidateReferenceWorkflows();

  return reference;
}

export async function deleteReferenceAction(referenceId: string) {
  const userId = await getCurrentUserId();

  const linkCount = await getReferenceEntityLinkCount(referenceId, userId);

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
  const location = String(formData.get("location") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!noteId || !referenceId) {
    return null;
  }

  const metadata = {
    pageNumber: pageNumber || null,
    location: location || null,
    quote: quote || null,
    summary: summary || null,
  };

  const link = await createEntityLink({
    createdByUserId: userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "uses",
    metadata: JSON.stringify(metadata),
  });

  revalidateReferenceWorkflows(noteId);

  return link;
}

export async function removeReferenceFromNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const noteId = String(formData.get("noteId") ?? "");
  const referenceId = String(formData.get("referenceId") ?? "");

  if (!noteId || !referenceId) {
    return null;
  }

  const removed = await deleteEntityLink({
    userId,
    sourceType: "note",
    sourceId: noteId,
    targetType: "reference",
    targetId: referenceId,
    relationshipType: "references",
  });

  revalidateReferenceWorkflows(noteId);

  return removed;
}

export async function getReferencesForNoteAction(noteId: string) {
  const userId = await getCurrentUserId();
  return getReferencesForNote(userId, noteId);
}
