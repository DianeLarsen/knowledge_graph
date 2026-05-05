import {
  notes,
  entityTags,
  entityLinks,
  tags,
  noteReferences,
  referencesTable,
  type RelationshipType,
  type NewEntityLink,
  type NewEntityTag,
} from "../schema";
import { db } from "../index";
import {
  and,
  desc,
  eq,
  inArray,
  isNull,
  isNotNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { getBacklinks, getOutgoingLinks } from "./entitylinks";
import { getNotesForTag, getTagsForNote } from "./entitytags";
import { alias } from "drizzle-orm/sqlite-core";
import { getTagStats } from "./tags";
const RELATED: RelationshipType = "related";
type CreateNoteInput = {
  title: string;
  content: string;
  contentJson?: string;
  userId: string;
  selectedTagIds?: string[];
  newTagName?: string;
  linkedNoteIds?: string[];
  inlineTagNames?: string[];
  selectedReferenceIds?: string[];
};

export async function createNote(input: CreateNoteInput) {
  const title = input.title.trim();
  const content = input.content.trim();
  const contentJson = input.contentJson ?? "";
  const selectedTagIds = input.selectedTagIds ?? [];
  const linkedNoteIds = input.linkedNoteIds ?? [];
  const newTagName = input.newTagName?.trim();
  const selectedReferenceIds = input.selectedReferenceIds ?? [];

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
  const tagValues: NewEntityTag[] = tagIds.map((tagId) => ({
    userId: input.userId,
    entityType: "note",
    entityId: newNote.id,
    tagId,
  }));

  tx.insert(entityTags).values(tagValues).run();
}

    const cleanedLinkedNoteIds = [
      ...new Set(
        linkedNoteIds.filter(
          (targetNoteId) => targetNoteId && targetNoteId !== newNote.id,
        ),
      ),
    ];

    if (cleanedLinkedNoteIds.length > 0) {
      const linkValues: NewEntityLink[] = cleanedLinkedNoteIds.map(
        (targetNoteId) => ({
          userId: input.userId,
          sourceType: "note",
          sourceId: newNote.id,
          targetType: "note",
          targetId: targetNoteId,
          relationshipType: RELATED,
        }),
      );

      tx.insert(entityLinks).values(linkValues).run();
    }

    if (selectedReferenceIds.length > 0) {
      tx.insert(noteReferences)
        .values(
          selectedReferenceIds.map((referenceId) => ({
            noteId: newNote.id,
            referenceId,
          })),
        )
        .run();
    }
    return newNote;
  });

  return result;
}

export async function getAllNotes() {
  return await db.select().from(notes).where(isNull(notes.deletedAt));
}

export async function getNoteById(id: string) {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.deletedAt)));

  return result[0];
}

export async function getNotesByUser(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.deletedAt)));
}

export async function getDeletedNotes() {
  return await db.select().from(notes).where(isNotNull(notes.deletedAt));
}

export async function searchNotes(query: string) {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        isNull(notes.deletedAt),
        or(
          sql`LOWER(${notes.title}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${notes.content}) LIKE LOWER(${`%${query}%`})`,
        ),
      ),
    );
}

export async function searchNotesByUser(userId: string, query: string) {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        isNull(notes.deletedAt),
        or(
          sql`LOWER(${notes.title}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${notes.content}) LIKE LOWER(${`%${query}%`})`,
        ),
      ),
    );
}
export async function getReferencesForNote(noteId: string) {
  return await db
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
export async function getNoteDetailsById(id: string) {
  const note = await getNoteById(id);

  if (!note) {
    return null;
  }

  const tags = await getTagsForNote(id);
  const outgoingLinks = await getOutgoingLinks(id, note.userId);
  const backlinks = await getBacklinks(id, note.userId);
  const sharedTags = await getNotesForTag(id);
  const references = await getReferencesForNote(id);

  const tagStats = await Promise.all(
    tags.map(async (tag) => ({
      tag,
      stats: await getTagStats(tag.id, note.userId),
    })),
  );

  return {
    note,
    tags,
    tagStats,
    outgoingLinks,
    backlinks,
    sharedTags,
    references,
  };
}
export async function getNotesForUser(userId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt));
}
export async function updateNote(
  id: string,
  userId: string,
  title: string,
  content: string,
  contentJson?: string,
  inlineTagNames: string[] = [],
  selectedReferenceIds: string[] = [],
  linkedNoteIds: string[] = [],
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
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning()
      .get();

    if (!updatedNote) {
      throw new Error("Note not found.");
    }

    const cleanedTagNames = [
      ...new Set(inlineTagNames.map((name) => name.trim()).filter(Boolean)),
    ];

    for (const tagName of cleanedTagNames) {
      let tag = tx.select().from(tags).where(eq(tags.name, tagName)).get();

      if (!tag) {
        tag = tx.insert(tags).values({ name: tagName }).returning().get();
      }

      const existingEntityTag = tx
        .select()
        .from(entityTags)
        .where(
          and(
            eq(entityTags.userId, userId),
            eq(entityTags.entityType, "note"),
            eq(entityTags.entityId, id),
            eq(entityTags.tagId, tag.id),
          ),
        )
        .get();

      if (!existingEntityTag) {
        tx.insert(entityTags)
          .values({
            userId,
            entityType: "note",
            entityId: id,
            tagId: tag.id,
          })
          .run();
      }
    }

    tx.delete(noteReferences).where(eq(noteReferences.noteId, id)).run();

    if (selectedReferenceIds.length > 0) {
      tx.insert(noteReferences)
        .values(
          selectedReferenceIds.map((referenceId) => ({
            noteId: id,
            referenceId,
          })),
        )
        .run();
    }

    tx.delete(entityLinks)
      .where(
        and(
          eq(entityLinks.userId, userId),
          eq(entityLinks.sourceType, "note"),
          eq(entityLinks.sourceId, id),
          eq(entityLinks.targetType, "note"),
        ),
      )
      .run();

    const cleanedLinkedNoteIds = [
      ...new Set(linkedNoteIds.filter((noteId) => noteId && noteId !== id)),
    ];

if (cleanedLinkedNoteIds.length > 0) {
  const linkValues: NewEntityLink[] = cleanedLinkedNoteIds.map(
    (targetNoteId) => ({
      userId,
      sourceType: "note",
      sourceId: id,
      targetType: "note",
      targetId: targetNoteId,
      relationshipType: RELATED,
    }),
  );

  tx.insert(entityLinks).values(linkValues).run();
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

export async function getOrphanNotes() {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        isNull(notes.deletedAt),
        sql`NOT EXISTS (
          SELECT 1 FROM entity_links
          WHERE entity_links.source_type = 'note'
          AND entity_links.source_id = ${notes.id}
        )
        AND NOT EXISTS (
          SELECT 1 FROM entity_links
          WHERE entity_links.target_type = 'note'
          AND entity_links.target_id = ${notes.id}
        )`,
      ),
    );
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
  const result = await db.delete(notes).where(eq(notes.id, id)).returning();
  return result[0];
}

export async function getNotesSharingTags(noteId: string) {
  const currentNoteTags = alias(entityTags, "current_note_tags");

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
    .from(entityTags)
    .innerJoin(
      notes,
      and(eq(entityTags.entityType, "note"), eq(entityTags.entityId, notes.id)),
    )
    .innerJoin(tags, eq(entityTags.tagId, tags.id))
    .where(
      and(
        eq(entityTags.entityType, "note"),
        inArray(
          entityTags.tagId,
          db
            .select({ tagId: currentNoteTags.tagId })
            .from(currentNoteTags)
            .where(
              and(
                eq(currentNoteTags.entityType, "note"),
                eq(currentNoteTags.entityId, noteId),
              ),
            ),
        ),
        ne(notes.id, noteId),
        isNull(notes.deletedAt),
      ),
    );
}

export async function getRelatedNotes(noteId: string, userId: string) {
  const outgoingLinks = await getOutgoingLinks(noteId, userId);
  const backlinks = await getBacklinks(noteId, userId);
  const sharedTags = await getNotesSharingTags(noteId);
  return {
    outgoingLinks,
    backlinks,
    sharedTags,
  };
}

export async function getOrphanNotesByUser(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        isNull(notes.deletedAt),
        sql`NOT EXISTS (
          SELECT 1 FROM entity_links
          WHERE entity_links.user_id = ${userId}
          AND entity_links.source_type = 'note'
          AND entity_links.source_id = ${notes.id}
        )
        AND NOT EXISTS (
          SELECT 1 FROM entity_links
          WHERE entity_links.user_id = ${userId}
          AND entity_links.target_type = 'note'
          AND entity_links.target_id = ${notes.id}
        )`,
      ),
    );
}

export async function getNoteDetailsByUserId(userId: string) {
  const userNotes = await getNotesByUser(userId);

  return Promise.all(
    userNotes.map(async (note) => {
      const tags = await getTagsForNote(note.id);

      const tagStats = await Promise.all(
        tags.map(async (tag) => ({
          tag,
          stats: await getTagStats(tag.id, userId),
        })),
      );

      const outgoingLinks = await getOutgoingLinks(note.id, userId);
      const backlinks = await getBacklinks(note.id, userId);
      const sharedTags = await getNotesForTag(note.id);
      const references = await getReferencesForNote(note.id);

      return {
        note,
        tags,
        tagStats,
        outgoingLinks,
        backlinks,
        sharedTags,
        references,
      };
    }),
  );
}
