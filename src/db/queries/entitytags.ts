import { and, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { db } from "../index";
import { entityTags, notes, tags } from "../schema";

export async function addTagToNote(
  userId: string,
  noteId: string,
  tagId: string,
) {
  const tag = await db
    .select({ id: tags.id })
    .from(tags)
    .where(
      and(
        eq(tags.id, tagId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    );

  if (!tag[0]) {
    throw new Error("Tag not found.");
  }

  const [result] = await db
    .insert(entityTags)
    .values({
      appliedByUserId: userId,
      entityType: "note",
      entityId: noteId,
      tagId,
    })
    .onConflictDoNothing()
    .returning();

  return result ?? null;
}

export async function removeTagFromNote(
  userId: string,
  noteId: string,
  tagId: string,
) {
  const [result] = await db
    .delete(entityTags)
    .where(
      and(
        eq(entityTags.appliedByUserId, userId),
        eq(entityTags.entityType, "note"),
        eq(entityTags.entityId, noteId),
        eq(entityTags.tagId, tagId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function getTagsForNote(userId: string, noteId: string) {
  return db
    .select({
      id: tags.id,
      createdByUserId: tags.createdByUserId,
      scopeType: tags.scopeType,
      scopeId: tags.scopeId,
      name: tags.name,
      slug: tags.slug,
      visibility: tags.visibility,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
      deletedAt: tags.deletedAt,
      color: tags.color,
    })
    .from(entityTags)
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(entityTags.entityType, "note"),
        eq(entityTags.entityId, noteId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    );
}

export async function getNotesSharingTagsWithNote(
  userId: string,
  noteId: string,
) {
  const noteTagRows = await db
    .select({
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(entityTags.entityType, "note"),
        eq(entityTags.entityId, noteId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(tags.deletedAt),
      ),
    );

  const tagIds = noteTagRows.map((row) => row.tagId);

  if (tagIds.length === 0) {
    return [];
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      contentJson: notes.contentJson,
      createdByUserId: notes.createdByUserId,
      ownerType: notes.ownerType,
      ownerId: notes.ownerId,
      visibility: notes.visibility,
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
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        inArray(entityTags.tagId, tagIds),
        ne(notes.id, noteId),
        isNull(notes.deletedAt),
        isNull(tags.deletedAt),
      ),
    );
}

export async function getNoteTagsByUser(userId: string) {
  return db
    .select({
      noteId: entityTags.entityId,
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .innerJoin(
      notes,
      and(eq(entityTags.entityType, "note"), eq(entityTags.entityId, notes.id)),
    )
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        or(
          and(eq(tags.scopeType, "user"), eq(tags.scopeId, userId)),
          eq(tags.scopeType, "public"),
        ),
        isNull(notes.deletedAt),
        isNull(tags.deletedAt),
      ),
    );
}
