import { noteTags, noteLinks, notes, tags } from "../schema";
import { db } from "../index";
import { eq, and, sql, relations } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

type NoteLinkResult = {
  targetNoteId: string;
  targetTitle: string | null;
  sourceTitle: string | null;
  relationshipType: string;
};

export async function createNoteLink(
  sourceNoteId: string,
  targetNoteId: string,
  relationshipType: string,
) {
  const result = await db
    .insert(noteLinks)
    .values({ sourceNoteId, targetNoteId, relationshipType })
    .returning();
  return result[0];
}

export async function removeNoteLink(
  sourceNoteId: string,
  targetNoteId: string,
  relationshipType: string,
) {
  const result = await db
    .delete(noteLinks)
    .where(
      and(
        eq(noteLinks.sourceNoteId, sourceNoteId),
        eq(noteLinks.relationshipType, relationshipType),
        eq(noteLinks.targetNoteId, targetNoteId),
      ),
    )
    .returning();

  return result[0];
}

export async function getOutgoingLinks(noteId: string): Promise<NoteLinkResult[]>  {
    const sourceNote = alias(notes, "source_note");
    const targetNote = alias(notes, "target_note");

    return await db
    .select({
        targetNoteId: noteLinks.targetNoteId,
        targetTitle: targetNote.title,
        sourceTitle: sourceNote.title,
        relationshipType: noteLinks.relationshipType,
    })
    .from(noteLinks)
    .leftJoin(sourceNote, eq(sourceNote.id, noteLinks.sourceNoteId))
    .leftJoin(targetNote, eq(targetNote.id, noteLinks.targetNoteId))
    .where(eq(noteLinks.sourceNoteId, noteId));
}



export async function getBacklinks(noteId: string) {
    const sourceNote = alias(notes, "source_note");
    const targetNote = alias(notes, "target_note");

    return await db
    .select({
        targetNoteId: noteLinks.targetNoteId,
        targetTitle: targetNote.title,
        sourceTitle: sourceNote.title,
      relationshipType: noteLinks.relationshipType,
        sourceNoteId: noteLinks.sourceNoteId,
    })
    .from(noteLinks)
    .leftJoin(sourceNote, eq(sourceNote.id, noteLinks.sourceNoteId))
    .leftJoin(targetNote, eq(targetNote.id, noteLinks.targetNoteId))
    .where(eq(noteLinks.targetNoteId, noteId));
}
