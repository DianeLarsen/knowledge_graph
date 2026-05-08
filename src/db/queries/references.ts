import { and, count, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../index";
import {
  referencesTable,
  noteReferences,
  notes,
  type NewReference,
  type NewNoteReference,
} from "@/db/schema";

export async function createReference(reference: NewReference) {
  const [result] = await db
    .insert(referencesTable)
    .values(reference)
    .returning();

  return result ?? null;
}

export async function createUserReference(
  userId: string,
  reference: Omit<
    NewReference,
    "createdByUserId" | "ownerType" | "ownerId" | "visibility"
  >,
) {
  const [result] = await db
    .insert(referencesTable)
    .values({
      ...reference,
      createdByUserId: userId,
      ownerType: "user",
      ownerId: userId,
      visibility: "private",
    })
    .returning();

  return result ?? null;
}

export async function getReferencesForUser(userId: string) {
  return db
    .select()
    .from(referencesTable)
    .where(
      and(
        eq(referencesTable.ownerType, "user"),
        eq(referencesTable.ownerId, userId),
      ),
    )
    .orderBy(desc(referencesTable.createdAt));
}

export async function getReferenceById(id: string, userId: string) {
  const [result] = await db
    .select()
    .from(referencesTable)
    .where(
      and(
        eq(referencesTable.id, id),
        or(
          and(
            eq(referencesTable.ownerType, "user"),
            eq(referencesTable.ownerId, userId),
          ),
          eq(referencesTable.visibility, "public"),
        ),
      ),
    );

  return result ?? null;
}

export async function updateReference(
  id: string,
  userId: string,
  data: Partial<NewReference>,
) {
  const [result] = await db
    .update(referencesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(referencesTable.id, id),
        eq(referencesTable.ownerType, "user"),
        eq(referencesTable.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function getReferenceLinkCount(referenceId: string) {
  const [result] = await db
    .select({
      linkCount: count(noteReferences.id),
    })
    .from(noteReferences)
    .where(eq(noteReferences.referenceId, referenceId));

  return result?.linkCount ?? 0;
}

export async function deleteReference(id: string, userId: string) {
  const [result] = await db
    .delete(referencesTable)
    .where(
      and(
        eq(referencesTable.id, id),
        eq(referencesTable.ownerType, "user"),
        eq(referencesTable.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function addReferenceToNote(noteReference: NewNoteReference) {
  const [result] = await db
    .insert(noteReferences)
    .values(noteReference)
    .onConflictDoNothing()
    .returning();

  return result ?? null;
}

export async function getReferencesForNote(userId: string, noteId: string) {
  return db
    .select({
      id: referencesTable.id,
      createdByUserId: referencesTable.createdByUserId,
      ownerType: referencesTable.ownerType,
      ownerId: referencesTable.ownerId,
      visibility: referencesTable.visibility,
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
    .where(
      and(
        eq(noteReferences.noteId, noteId),
        or(
          and(
            eq(referencesTable.ownerType, "user"),
            eq(referencesTable.ownerId, userId),
          ),
          eq(referencesTable.visibility, "public"),
        ),
      ),
    );
}

export async function updateNoteReference(
  noteReferenceId: string,
  userId: string,
  data: Partial<NewNoteReference>,
) {
  const [result] = await db
    .update(noteReferences)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(noteReferences.id, noteReferenceId))
    .returning();

  return result ?? null;
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

  return result ?? null;
}

export async function getNoteReferencesByUserId(userId: string) {
  return db
    .select({
      id: referencesTable.id,
      createdByUserId: referencesTable.createdByUserId,
      ownerType: referencesTable.ownerType,
      ownerId: referencesTable.ownerId,
      visibility: referencesTable.visibility,
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
    .innerJoin(notes, eq(noteReferences.noteId, notes.id))
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
        or(
          and(
            eq(referencesTable.ownerType, "user"),
            eq(referencesTable.ownerId, userId),
          ),
          eq(referencesTable.visibility, "public"),
        ),
      ),
    );
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
    .where(
      and(
        eq(referencesTable.ownerType, "user"),
        eq(referencesTable.ownerId, userId),
      ),
    );

  return existingReferences.find((reference) => {
    const sameUrl = url && reference.url === url;
    const sameTitle =
      reference.title.toLowerCase().trim() === title.toLowerCase().trim();

    return sameUrl || sameTitle;
  });
}

export async function getReferences(userId: string) {
  const references = await db
    .select({
      id: referencesTable.id,
      createdByUserId: referencesTable.createdByUserId,
      ownerType: referencesTable.ownerType,
      ownerId: referencesTable.ownerId,
      visibility: referencesTable.visibility,
      type: referencesTable.type,
      title: referencesTable.title,
      author: referencesTable.author,
      url: referencesTable.url,
      publisher: referencesTable.publisher,
      publishedDate: referencesTable.publishedDate,
      citation: referencesTable.citation,
      notes: referencesTable.notes,
      createdAt: referencesTable.createdAt,
      updatedAt: referencesTable.updatedAt,
    })
    .from(referencesTable)
    .where(
      and(
        eq(referencesTable.ownerType, "user"),
        eq(referencesTable.ownerId, userId),
      ),
    )
    .orderBy(desc(referencesTable.createdAt));

  const links = await db
    .select({
      referenceId: noteReferences.referenceId,
      noteId: notes.id,
      noteTitle: notes.title,
      noteContent: notes.content,
    })
    .from(noteReferences)
    .innerJoin(notes, eq(noteReferences.noteId, notes.id))
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
      ),
    );

  return references.map((reference) => {
    const linkedNotes = links
      .filter((link) => link.referenceId === reference.id)
      .map((link) => ({
        id: link.noteId,
        title: link.noteTitle,
        content: link.noteContent,
      }));

    return {
      ...reference,
      linkCount: linkedNotes.length,
      linkedNotes,
    };
  });
}
