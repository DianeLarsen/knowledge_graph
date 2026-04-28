import { notes, noteTags, tags, noteLinks  } from "../schema";
import { db } from "../index";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { getBacklinks, getOutgoingLinks } from "./noteLinks";
import { getTagsForNote } from "./notetags";
import { alias } from "drizzle-orm/sqlite-core";

type CreateNoteInput = {
  title: string;
  content: string;
  contentJson?: string;
  userId: string;
  selectedTagIds?: string[];
  newTagName?: string;
  linkedNoteIds?: string[];
  inlineTagNames?: string[];
};

export async function createNote(input: CreateNoteInput) {
  const title = input.title.trim();
  const content = input.content.trim();
  const contentJson = input.contentJson ?? "";
  const selectedTagIds = input.selectedTagIds ?? [];
  const linkedNoteIds = input.linkedNoteIds ?? [];
  const newTagName = input.newTagName?.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  const result = db.transaction((tx) => {
  const newNote = tx
    .insert(notes)
    .values({
      title,
      content,
      contentJson,
      userId: input.userId,
    })
    .returning()
    .get();

  let tagIds = [...selectedTagIds];

const inlineTagNames = input.inlineTagNames ?? [];
const cleanedInlineTagNames = [
  ...new Set(inlineTagNames.map((name) => name.trim()).filter(Boolean)),
];

  if (newTagName) {
    const existingTag = tx
      .select()
      .from(tags)
      .where(eq(tags.name, newTagName))
      .get();

    if (existingTag) {
      tagIds.push(existingTag.id);
    } else {
      const createdTag = tx
        .insert(tags)
        .values({
          name: newTagName,
        })
        .returning()
        .get();

      tagIds.push(createdTag.id);
    }
  }
    for (const tagName of cleanedInlineTagNames) {
  const existingTag = tx
    .select()
    .from(tags)
    .where(eq(tags.name, tagName))
    .get();

  if (existingTag) {
    tagIds.push(existingTag.id);
  } else {
    const createdTag = tx
      .insert(tags)
      .values({ name: tagName })
      .returning()
      .get();

    tagIds.push(createdTag.id);
  }
}

  tagIds = [...new Set(tagIds)];

  if (tagIds.length > 0) {
    tx.insert(noteTags)
      .values(
        tagIds.map((tagId) => ({
          noteId: newNote.id,
          tagId,
        })),
      )
      .run();
  }

  if (linkedNoteIds.length > 0) {
    tx.insert(noteLinks)
      .values(
        linkedNoteIds.map((targetNoteId) => ({
          sourceNoteId: newNote.id,
          targetNoteId,
          relationshipType: "related",
        })),
      )
      .run();
  }

  return newNote;
});

  return result;
}

export async function getAllNotes() {
  return await db.select().from(notes).where(sql`${notes.deletedAt} IS NULL`);;
}

export async function getNoteById(id: string) {
  const result = await db.select().from(notes).where(eq(notes.id, id));
  return result[0];
}

export async function getNoteDetailsById(id: string) {
  const note = await getNoteById(id);
  const tags = await getTagsForNote(id);
  const outgoingLinks = await getOutgoingLinks(id);
  const backlinks = await getBacklinks(id);
  const sharedTags = await getNotesSharingTags(id);

  return {
    note,
    tags,
    outgoingLinks,
    backlinks,
    sharedTags,
  };
}

export async function updateNote(
  id: string,
  title: string,
  content: string,
  contentJson?: string,
  inlineTagNames: string[] = [],
) {
  const result = db.transaction((tx) => {
    const updatedNote = tx
      .update(notes)
      .set({
        title,
        content,
        contentJson,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning()
      .get();

    const cleanedTagNames = [...new Set(
      inlineTagNames
        .map((name) => name.trim())
        .filter(Boolean),
    )];

    for (const tagName of cleanedTagNames) {
      let tag = tx
        .select()
        .from(tags)
        .where(eq(tags.name, tagName))
        .get();

      if (!tag) {
        tag = tx
          .insert(tags)
          .values({ name: tagName })
          .returning()
          .get();
      }

      const existingNoteTag = tx
        .select()
        .from(noteTags)
        .where(
          and(
            eq(noteTags.noteId, id),
            eq(noteTags.tagId, tag.id),
          ),
        )
        .get();

      if (!existingNoteTag) {
        tx.insert(noteTags)
          .values({
            noteId: id,
            tagId: tag.id,
          })
          .run();
      }
    }

    return updatedNote;
  });

  return result;
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