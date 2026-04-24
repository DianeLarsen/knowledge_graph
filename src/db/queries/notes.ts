import { notes, noteTags, tags } from "../schema";
import { db } from "../index";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { getBacklinks, getOutgoingLinks } from "./noteLinks";
import { alias } from "drizzle-orm/sqlite-core";

export async function createNote(title: string, content: string, userId: string) {
  const result = await db
    .insert(notes)
    .values({ title, content, userId })
    .returning();
  return result[0];
} 

export async function getAllNotes() {
  return await db.select().from(notes).where(sql`${notes.deletedAt} IS NULL`);;
}

export async function getNoteById(id: string) {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  return result[0];
}

export async function updateNote(id: string, title: string, content: string) {
  const result = await db
    .update(notes)
    .set({ title, content })
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}

export async function deleteNote(id: string) {
  const result = await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}

export async function searchNotes(query: string) {
  return await db
    .select()
    .from(notes)
    .where(
      sql`${notes.deletedAt} IS NULL AND (LOWER(${notes.title}) LIKE LOWER(${`%${query}%`}) OR LOWER(${notes.content}) LIKE LOWER(${`%${query}%`}))`,
    );
}

export async function getOrphanNotes() {
  return await db
    .select()
    .from(notes)
    .where(
      sql`${notes.deletedAt} IS NULL AND NOT EXISTS (SELECT 1 FROM note_links WHERE note_links.source_note_id = ${notes.id} OR note_links.target_note_id = ${notes.id})`
    );
}

export async function getDeletedNotes() {
  return await db
    .select()
    .from(notes)
    .where(sql`${notes.deletedAt} IS NOT NULL`);
}

export async function restoreNote(id: string) {
  const result = await db
    .update(notes)
    .set({ deletedAt: null })
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}

export async function permanentlyDeleteNote(id: string) {
  const result = await db
    .delete(notes)
    .where(eq(notes.id, id))
    .returning();
  return result[0];
}

export async function getNotesSharingTags(noteId: string) {
  const currentNoteTags = alias(noteTags, "current_note_tags");

  return await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      deletedAt: notes.deletedAt,
      sharedTagId: tags.id,
      sharedTagName: tags.name,
    })
    .from(noteTags)
    .innerJoin(notes, eq(noteTags.noteId, notes.id))
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(
      and(
        inArray(
          noteTags.tagId,
          db
            .select({ tagId: currentNoteTags.tagId })
            .from(currentNoteTags)
            .where(eq(currentNoteTags.noteId, noteId))
        ),
        ne(notes.id, noteId),
        sql`${notes.deletedAt} IS NULL`
      )
    );
}

export async function getRelatedNotes(noteId: string) {

  const outgoingLinks = await getOutgoingLinks(noteId);
  const backlinks = await getBacklinks(noteId);
  const sharedTags = await getNotesSharingTags(noteId);
  return {
    outgoingLinks,
    backlinks,
    sharedTags
  }
}

export async function getNotesByUser(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), sql`${notes.deletedAt} IS NULL`));
}
export async function searchNotesByUser(userId: string, query: string) {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        sql`${notes.deletedAt} IS NULL AND (LOWER(${notes.title}) LIKE LOWER(${`%${query}%`}) OR LOWER(${notes.content}) LIKE LOWER(${`%${query}%`}))`
      )
    );
}
export async function getOrphanNotesByUser(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        sql`${notes.deletedAt} IS NULL AND NOT EXISTS (SELECT 1 FROM note_links WHERE note_links.source_note_id = ${notes.id} OR note_links.target_note_id = ${notes.id})`
      )
    );
}