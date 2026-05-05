import { entityTags, notes, tags } from "../schema";
import { db } from "../index";
import { eq, and, ne, isNull } from "drizzle-orm";

export async function addTagToNote(
  userId: string,
  noteId: string,
  tagId: string,
) {
  const result = await db
    .insert(entityTags)
    .values({
      userId,
      entityType: "note",
      entityId: noteId,
      tagId,
    })
    .returning();

  return result[0];
}

export async function removeTagFromNote(
  userId: string,
  noteId: string,
  tagId: string,
) {
  const result = await db
    .delete(entityTags)
    .where(
      and(
        eq(entityTags.userId, userId),
        eq(entityTags.entityType, "note"),
        eq(entityTags.entityId, noteId),
        eq(entityTags.tagId, tagId),
      ),
    )
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
    .from(entityTags)
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(eq(entityTags.entityType, "note"), eq(entityTags.entityId, noteId)),
    );
}

export async function getNotesSharingTagsWithNote(noteId: string) {
  const noteTagRows = await db
    .select({
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .where(
      and(eq(entityTags.entityType, "note"), eq(entityTags.entityId, noteId)),
    );

  if (noteTagRows.length === 0) {
    return [];
  }

  const tagIds = noteTagRows.map((row) => row.tagId);

  const results = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      contentJson: notes.contentJson,
      userId: notes.userId,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      deletedAt: notes.deletedAt,

      sharedTagId: tags.id,
      sharedTagName: tags.name,
    })
    .from(notes)
    .innerJoin(
      entityTags,
      and(eq(entityTags.entityType, "note"), eq(notes.id, entityTags.entityId)),
    )
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(and(ne(notes.id, noteId), isNull(notes.deletedAt)));

  return results.filter((row) => tagIds.includes(row.sharedTagId));
}

export async function getNoteTagsByUser(userId: string) {
  return await db
    .select({
      noteId: entityTags.entityId,
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .innerJoin(
      notes,
      and(eq(entityTags.entityType, "note"), eq(entityTags.entityId, notes.id)),
    )
    .where(
      and(
        eq(entityTags.userId, userId),
        eq(notes.userId, userId),
        isNull(notes.deletedAt),
      ),
    );
}

export const getNotesForTag = getNotesSharingTagsWithNote;