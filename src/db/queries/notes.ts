import {
  notes,
  entityTags,
  entityLinks,
  tags,
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
  isNull,
  isNotNull,
  or,
  sql,
  inArray,
} from "drizzle-orm";
import { getBacklinks, getOutgoingLinks } from "./entitylinks";
import { getNotesSharingTagsWithNote, getTagsForNote } from "./entitytags";
import { getTagStats } from "./tags";

const RELATED: RelationshipType = "related";

function slugifyTag(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

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

  if (!title) {
    throw new Error("Title is required.");
  }

  return db.transaction((tx) => {
    const newNote = tx
      .insert(notes)
      .values({
        title,
        content,
        contentJson,
        createdByUserId: input.userId,
        ownerType: "user",
        ownerId: input.userId,
        visibility: "private",
      })
      .returning()
      .get();

    let tagIds = [...(input.selectedTagIds ?? [])];

    const tagNames = [input.newTagName, ...(input.inlineTagNames ?? [])].filter(
      Boolean,
    ) as string[];

    const cleanedTagNames = [
      ...new Set(tagNames.map((name) => name.trim()).filter(Boolean)),
    ];

    for (const tagName of cleanedTagNames) {
      const cleanName = tagName.toLowerCase();
      const slug = slugifyTag(cleanName);

      let tag = tx
        .select()
        .from(tags)
        .where(
          and(
            eq(tags.scopeType, "user"),
            eq(tags.scopeId, input.userId),
            eq(tags.slug, slug),
            isNull(tags.deletedAt),
          ),
        )
        .get();

      if (!tag) {
        tag = tx
          .insert(tags)
          .values({
            createdByUserId: input.userId,
            scopeType: "user",
            scopeId: input.userId,
            name: cleanName,
            slug,
          })
          .returning()
          .get();
      }

      tagIds.push(tag.id);
    }

    tagIds = [...new Set(tagIds)];

    if (tagIds.length > 0) {
      const validTags = tx
        .select({ id: tags.id })
        .from(tags)
        .where(
          and(
            or(
              and(eq(tags.scopeType, "user"), eq(tags.scopeId, input.userId)),
              eq(tags.scopeType, "public"),
            ),
            inArray(tags.id, tagIds),
            isNull(tags.deletedAt),
          ),
        )
        .all();

      tagIds = validTags.map((tag) => tag.id);
    }

    if (tagIds.length > 0) {
      const tagValues: NewEntityTag[] = tagIds.map((tagId) => ({
        appliedByUserId: input.userId,
        entityType: "note",
        entityId: newNote.id,
        tagId,
      }));

      tx.insert(entityTags).values(tagValues).onConflictDoNothing().run();
    }

    const cleanedLinkedNoteIds = [
      ...new Set(
        (input.linkedNoteIds ?? []).filter(
          (targetNoteId) => targetNoteId && targetNoteId !== newNote.id,
        ),
      ),
    ];

    if (cleanedLinkedNoteIds.length > 0) {
      const linkValues: NewEntityLink[] = cleanedLinkedNoteIds.map(
        (targetNoteId) => ({
          createdByUserId: input.userId,
          sourceType: "note",
          sourceId: newNote.id,
          targetType: "note",
          targetId: targetNoteId,
          relationshipType: RELATED,
        }),
      );

      tx.insert(entityLinks).values(linkValues).onConflictDoNothing().run();
    }

const selectedReferenceIds = [
  ...new Set((input.selectedReferenceIds ?? []).filter(Boolean)),
];

if (selectedReferenceIds.length > 0) {
  const referenceLinkValues: NewEntityLink[] = selectedReferenceIds.map(
    (referenceId) => ({
      createdByUserId: input.userId,
      sourceType: "note",
      sourceId: newNote.id,
      targetType: "reference",
      targetId: referenceId,
      relationshipType: "uses",
      metadata: null,
    }),
  );

  tx.insert(entityLinks)
    .values(referenceLinkValues)
    .onConflictDoNothing()
    .run();
}

    return newNote;
  });
}

export async function getAllNotes() {
  return db.select().from(notes).where(isNull(notes.deletedAt));
}

export async function getNoteById(id: string) {
  const result = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.deletedAt)));

  return result[0] ?? null;
}

export async function getNotesByUser(userId: string) {
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
      ),
    )
    .orderBy(desc(notes.updatedAt));
}

export async function getDeletedNotesByUser(userId: string) {
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNotNull(notes.deletedAt),
      ),
    );
}

export async function searchNotesByUser(userId: string, query: string) {
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
        isNull(notes.deletedAt),
        or(
          sql`LOWER(${notes.title}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${notes.content}) LIKE LOWER(${`%${query}%`})`,
        ),
      ),
    );
}

function parseReferenceMetadata(metadata: string | null) {
  if (!metadata) {
    return {
      pageNumber: null,
      location: null,
      quote: null,
      summary: null,
    };
  }

  try {
    const parsed = JSON.parse(metadata) as {
      pageNumber?: string | null;
      location?: string | null;
      quote?: string | null;
      summary?: string | null;
    };

    return {
      pageNumber: parsed.pageNumber ?? null,
      location: parsed.location ?? null,
      quote: parsed.quote ?? null,
      summary: parsed.summary ?? null,
    };
  } catch {
    return {
      pageNumber: null,
      location: null,
      quote: null,
      summary: null,
    };
  }
}

export async function getReferencesForNote(userId: string, noteId: string) {
  const rows = await db
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

      linkId: entityLinks.id,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      metadata: entityLinks.metadata,
    })
    .from(entityLinks)
    .innerJoin(
      referencesTable,
      and(
        eq(entityLinks.targetType, "reference"),
        eq(entityLinks.targetId, referencesTable.id),
      ),
    )
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.sourceType, "note"),
        eq(entityLinks.sourceId, noteId),
        eq(entityLinks.targetType, "reference"),
        or(
          and(
            eq(referencesTable.ownerType, "user"),
            eq(referencesTable.ownerId, userId),
          ),
          eq(referencesTable.visibility, "public"),
        ),
      ),
    );

  return rows.map((row) => {
    const parsedMetadata = parseReferenceMetadata(row.metadata);

    return {
      ...row,
      noteReferenceId: row.linkId,
      pageNumber: parsedMetadata.pageNumber,
      location: parsedMetadata.location,
      quote: parsedMetadata.quote,
      summary: parsedMetadata.summary,
    };
  });
}

export async function getNoteDetailsById(id: string) {
  const note = await getNoteById(id);

  if (!note) {
    return null;
  }

  const userId = note.ownerId;

  const noteTags = await getTagsForNote(userId, id);
  const sharedTags = await getNotesSharingTagsWithNote(userId, id);
  const outgoingLinks = await getOutgoingLinks(id, userId);
  const backlinks = await getBacklinks(id, userId);
  const references = await getReferencesForNote(userId, id);

  const tagStats = await Promise.all(
    noteTags.map(async (tag) => ({
      tag,
      stats: await getTagStats(tag.id, userId),
    })),
  );

  return {
    note,
    tags: noteTags,
    tagStats,
    outgoingLinks,
    backlinks,
    sharedTags,
    references,
  };
}

export async function getNotesForUser(userId: string) {
  return getNotesByUser(userId);
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
  return db.transaction((tx) => {
    const updatedNote = tx
      .update(notes)
      .set({
        title,
        content,
        contentJson,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notes.id, id),
          eq(notes.ownerType, "user"),
          eq(notes.ownerId, userId),
          isNull(notes.deletedAt),
        ),
      )
      .returning()
      .get();

    if (!updatedNote) {
      throw new Error("Note not found.");
    }

    const cleanedTagNames = [
      ...new Set(inlineTagNames.map((name) => name.trim()).filter(Boolean)),
    ];

    for (const tagName of cleanedTagNames) {
      const cleanName = tagName.toLowerCase();
      const slug = slugifyTag(cleanName);

      let tag = tx
        .select()
        .from(tags)
        .where(
          and(
            eq(tags.scopeType, "user"),
            eq(tags.scopeId, userId),
            eq(tags.slug, slug),
            isNull(tags.deletedAt),
          ),
        )
        .get();

      if (!tag) {
        tag = tx
          .insert(tags)
          .values({
            createdByUserId: userId,
            scopeType: "user",
            scopeId: userId,
            name: cleanName,
            slug,
          })
          .returning()
          .get();
      }

      tx.insert(entityTags)
        .values({
          appliedByUserId: userId,
          entityType: "note",
          entityId: id,
          tagId: tag.id,
        })
        .onConflictDoNothing()
        .run();
    }

tx.delete(entityLinks)
  .where(
    and(
      eq(entityLinks.createdByUserId, userId),
      eq(entityLinks.sourceType, "note"),
      eq(entityLinks.sourceId, id),
      eq(entityLinks.targetType, "reference"),
    ),
  )
  .run();

const cleanedReferenceIds = [...new Set(selectedReferenceIds.filter(Boolean))];

if (cleanedReferenceIds.length > 0) {
  const referenceLinkValues: NewEntityLink[] = cleanedReferenceIds.map(
    (referenceId) => ({
      createdByUserId: userId,
      sourceType: "note",
      sourceId: id,
      targetType: "reference",
      targetId: referenceId,
      relationshipType: "uses",
      metadata: null,
    }),
  );

  tx.insert(entityLinks)
    .values(referenceLinkValues)
    .onConflictDoNothing()
    .run();
}

    tx.delete(entityLinks)
      .where(
        and(
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
          createdByUserId: userId,
          sourceType: "note",
          sourceId: id,
          targetType: "note",
          targetId: targetNoteId,
          relationshipType: RELATED,
        }),
      );

      tx.insert(entityLinks).values(linkValues).onConflictDoNothing().run();
    }

    return updatedNote;
  });
}

export async function deleteNote(id: string, userId: string) {
  const result = await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(notes.id, id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function restoreNote(id: string, userId: string) {
  const result = await db
    .update(notes)
    .set({ deletedAt: null })
    .where(
      and(
        eq(notes.id, id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function permanentlyDeleteNote(id: string, userId: string) {
  const result = await db
    .delete(notes)
    .where(
      and(
        eq(notes.id, id),
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function getRelatedNotes(noteId: string, userId: string) {
  const outgoingLinks = await getOutgoingLinks(noteId, userId);
  const backlinks = await getBacklinks(noteId, userId);
  const sharedTags = await getNotesSharingTagsWithNote(userId, noteId);

  return {
    outgoingLinks,
    backlinks,
    sharedTags,
  };
}

export async function getOrphanNotesByUser(userId: string) {
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.ownerType, "user"),
        eq(notes.ownerId, userId),
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

export async function getNoteDetailsByUserId(userId: string) {
  const userNotes = await getNotesByUser(userId);

  return Promise.all(
    userNotes.map(async (note) => {
      const noteTags = await getTagsForNote(userId, note.id);
      const sharedTags = await getNotesSharingTagsWithNote(userId, note.id);
      const outgoingLinks = await getOutgoingLinks(note.id, userId);
      const backlinks = await getBacklinks(note.id, userId);
      const references = await getReferencesForNote(userId, note.id);

      const tagStats = await Promise.all(
        noteTags.map(async (tag) => ({
          tag,
          stats: await getTagStats(tag.id, userId),
        })),
      );

      return {
        note,
        tags: noteTags,
        tagStats,
        outgoingLinks,
        backlinks,
        sharedTags,
        references,
      };
    }),
  );
}