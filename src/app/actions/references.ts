"use server";

import {
  createReference,
  updateReference,
  deleteReference,
  getReferenceLinkCount,
  getReferences,
} from "@/db/queries/references";
import { revalidatePath } from "next/cache";
import { type NewReference } from "@/db/schema";
import { findExistingReference } from "@/db/queries/references";
type ReferenceType =
  | "book"
  | "website"
  | "article"
  | "video"
  | "conversation"
  | "other";

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
export async function createReferenceAction(input: NewReference) {
  const reference = await createReference(input);

  revalidatePath("/workspace");
  revalidatePath("/notes");

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
}

export async function deleteReferenceAction(referenceId: string) {
  const linkCount = await getReferenceLinkCount(referenceId);

  if (linkCount > 0) {
    return;
  }

  await deleteReference(referenceId);

  revalidatePath("/notes/references");
}