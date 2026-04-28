import { noteTags, notes, tags } from "../schema";
import { db } from "../index";
import { eq, and, sql } from 'drizzle-orm';



export async function addTagToNote(noteId: string, tagId: string) {
  const result = await db.insert(noteTags).values({ noteId, tagId }).returning();
  return result[0];
}

export async function removeTagFromNote(noteId: string, tagId: string) {
  const result = await db
    .delete(noteTags)
    .where(and(eq(noteTags.noteId, noteId), eq(noteTags.tagId, tagId)))
    .returning();

  return result[0];
}

export async function getTagsForNote(noteId: string) {
  return await db
    .select({
      id: tags.id,
      name: tags.name,
      createdAt: tags.createdAt,
    })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(eq(noteTags.noteId, noteId));
}

export async function getNotesForTag(tagId: string) {
  return await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      deletedAt: notes.deletedAt,
    })
    .from(noteTags)
    .innerJoin(notes, eq(noteTags.noteId, notes.id))
    .where(and(eq(noteTags.tagId, tagId), sql`${notes.deletedAt} IS NULL`));
}

export async function getNoteTagsByUser(userId: string) {
  return await db
    .select({
      noteId: noteTags.noteId,
      tagId: noteTags.tagId,
    })
    .from(noteTags)
    .innerJoin(notes, eq(noteTags.noteId, notes.id))
    .where(and(eq(notes.userId, userId), sql`${notes.deletedAt} IS NULL`));
}