import { eq, and } from "drizzle-orm";
import { db } from "../index";
import {
  referencesTable,
  noteReferences,
  type NewReference,
  type NewNoteReference,
} from "@/db/schema";

export async function createReference(reference: NewReference) {
  const [result] = await db
    .insert(referencesTable)
    .values(reference)
    .returning();

  return result;
}

export async function getReferencesByUserId(userId: string) {
  return db
    .select()
    .from(referencesTable)
    .where(eq(referencesTable.userId, userId));
}

export async function getReferenceById(id: string) {
  const [result] = await db
    .select()
    .from(referencesTable)
    .where(eq(referencesTable.id, id));

  return result;
}

export async function updateReference(id: string, data: Partial<NewReference>) {
  const [result] = await db
    .update(referencesTable)
    .set(data)
    .where(eq(referencesTable.id, id))
    .returning();

  return result;
}

export async function deleteReference(id: string) {
  const [result] = await db
    .delete(referencesTable)
    .where(eq(referencesTable.id, id))
    .returning();

  return result;
}

export async function addReferenceToNote(noteReference: NewNoteReference) {
  const [result] = await db
    .insert(noteReferences)
    .values(noteReference)
    .returning();

  return result;
}

export async function getReferencesForNote(noteId: string) {
  return db
    .select({
      id: referencesTable.id,
      type: referencesTable.type,
      title: referencesTable.title,
      author: referencesTable.author,
      url: referencesTable.url,
      publisher: referencesTable.publisher,
      publishedDate: referencesTable.publishedDate,
      citation: referencesTable.citation,
      notes: referencesTable.notes,

      noteReferenceId: noteReferences.id,
      noteId: noteReferences.noteId,
      referenceId: noteReferences.referenceId,
      pageNumber: noteReferences.pageNumber,
      location: noteReferences.location,
      quote: noteReferences.quote,
      summary: noteReferences.summary,
    })
    .from(noteReferences)
    .innerJoin(
      referencesTable,
      eq(noteReferences.referenceId, referencesTable.id),
    )
    .where(eq(noteReferences.noteId, noteId));
}

export async function updateNoteReference(
  noteReferenceId: string,
  data: Partial<NewNoteReference>,
) {
  const [result] = await db
    .update(noteReferences)
    .set(data)
    .where(eq(noteReferences.id, noteReferenceId))
    .returning();

  return result;
}

export async function removeReferenceFromNote(
  noteId: string,
  referenceId: string,
) {
  const [result] = await db
    .delete(noteReferences)
    .where(
      and(
        eq(noteReferences.noteId, noteId),
        eq(noteReferences.referenceId, referenceId),
      ),
    )
    .returning();

  return result;
}

export async function getNoteReferencesByUserId(userId: string) {
  return db
    .select({
      id: referencesTable.id,
      type: referencesTable.type,
      title: referencesTable.title,
      author: referencesTable.author,
      url: referencesTable.url,
      publisher: referencesTable.publisher,
      publishedDate: referencesTable.publishedDate,
      citation: referencesTable.citation,
      notes: referencesTable.notes,

      noteReferenceId: noteReferences.id,
      noteId: noteReferences.noteId,
      referenceId: noteReferences.referenceId,
      pageNumber: noteReferences.pageNumber,
      location: noteReferences.location,
      quote: noteReferences.quote,
      summary: noteReferences.summary,
    })
    .from(noteReferences)
    .innerJoin(
      referencesTable,
      eq(noteReferences.referenceId, referencesTable.id),
    )
    .where(eq(referencesTable.userId, userId));
}

export async function findExistingReference({
  userId,
  title,
  url,
}: {
  userId: string;
  title: string;
  url?: string;
}) {
  const existingReferences = await db
    .select()
    .from(referencesTable)
    .where(eq(referencesTable.userId, userId));

  return existingReferences.find((reference) => {
    const sameUrl = url && reference.url === url;
    const sameTitle =
      reference.title.toLowerCase().trim() === title.toLowerCase().trim();

    return sameUrl || sameTitle;
  });
}