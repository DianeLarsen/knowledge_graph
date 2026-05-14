import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../index";
import {
  referencesTable,
  notes,
  tasks,
  captures,
  entityLinks,
  type NewReference,
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

export async function getReferencesForNote(userId: string, noteId: string) {
  const links = await db
    .select({
      linkId: entityLinks.id,
      noteId: entityLinks.sourceId,
      referenceId: entityLinks.targetId,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      metadata: entityLinks.metadata,

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

  return links.map((link) => {
    let parsedMetadata: {
      pageNumber?: string | null;
      location?: string | null;
      quote?: string | null;
      summary?: string | null;
    } | null = null;

    try {
      parsedMetadata = link.metadata ? JSON.parse(link.metadata) : null;
    } catch {
      parsedMetadata = null;
    }

    return {
      ...link,
      noteReferenceId: link.linkId,
      pageNumber: parsedMetadata?.pageNumber ?? null,
      location: parsedMetadata?.location ?? null,
      quote: parsedMetadata?.quote ?? null,
      summary: parsedMetadata?.summary ?? null,
    };
  });
}

export async function getNoteReferencesByUserId(userId: string) {
  const links = await db
    .select({
      linkId: entityLinks.id,
      noteId: notes.id,
      referenceId: referencesTable.id,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      metadata: entityLinks.metadata,

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
    })
    .from(entityLinks)
    .innerJoin(
      notes,
      and(
        eq(entityLinks.sourceType, "note"),
        eq(entityLinks.sourceId, notes.id),
      ),
    )
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
        eq(entityLinks.targetType, "reference"),
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

  return links.map((link) => {
    let parsedMetadata: {
      pageNumber?: string | null;
      location?: string | null;
      quote?: string | null;
      summary?: string | null;
    } | null = null;

    try {
      parsedMetadata = link.metadata ? JSON.parse(link.metadata) : null;
    } catch {
      parsedMetadata = null;
    }

    return {
      ...link,
      noteReferenceId: link.linkId,
      pageNumber: parsedMetadata?.pageNumber ?? null,
      location: parsedMetadata?.location ?? null,
      quote: parsedMetadata?.quote ?? null,
      summary: parsedMetadata?.summary ?? null,
    };
  });
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

const noteLinks = await db
  .select({
    referenceId: entityLinks.targetId,
    noteId: notes.id,
    noteTitle: notes.title,
    noteContent: notes.content,
    metadata: entityLinks.metadata,
  })
  .from(entityLinks)
  .innerJoin(
    notes,
    and(eq(entityLinks.sourceType, "note"), eq(entityLinks.sourceId, notes.id)),
  )
  .where(
    and(
      eq(entityLinks.createdByUserId, userId),
      eq(entityLinks.sourceType, "note"),
      eq(entityLinks.targetType, "reference"),
      eq(notes.ownerType, "user"),
      eq(notes.ownerId, userId),
      isNull(notes.deletedAt),
    ),
  );

  const entityReferenceLinks = await db
    .select()
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        or(
          eq(entityLinks.sourceType, "reference"),
          eq(entityLinks.targetType, "reference"),
        ),
      ),
    );

  const userTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
    })
    .from(tasks)
    .where(and(eq(tasks.ownerType, "user"), eq(tasks.ownerId, userId)));

  const userCaptures = await db
    .select({
      id: captures.id,
      rawText: captures.rawText,
      summary: captures.summary,
    })
    .from(captures)
    .where(and(eq(captures.ownerType, "user"), eq(captures.ownerId, userId)));

  return references.map((reference) => {
    const linkedNotes = noteLinks
      .filter((link) => link.referenceId === reference.id)
      .map((link) => ({
        id: link.noteId,
        title: link.noteTitle,
        content: link.noteContent,
      }));

    const relatedEntityLinks = entityReferenceLinks.filter((link) => {
      return (
        (link.sourceType === "reference" && link.sourceId === reference.id) ||
        (link.targetType === "reference" && link.targetId === reference.id)
      );
    });

    const linkedTasks = relatedEntityLinks
      .map((link) => {
        const taskId =
          link.sourceType === "task"
            ? link.sourceId
            : link.targetType === "task"
              ? link.targetId
              : null;

        if (!taskId) return null;

        const task = userTasks.find((item) => item.id === taskId);

        if (!task) return null;

        return {
          id: task.id,
          title: task.title,
          description: task.description,
        };
      })
      .filter((task): task is NonNullable<typeof task> => task !== null);

    const linkedCaptures = relatedEntityLinks
      .map((link) => {
        const captureId =
          link.sourceType === "capture"
            ? link.sourceId
            : link.targetType === "capture"
              ? link.targetId
              : null;

        if (!captureId) return null;

        const capture = userCaptures.find((item) => item.id === captureId);

        if (!capture) return null;

        return {
          id: capture.id,
          title: capture.summary ?? capture.rawText.slice(0, 60),
          summary: capture.summary,
        };
      })
      .filter(
        (capture): capture is NonNullable<typeof capture> => capture !== null,
      );

    const linkedReferences = relatedEntityLinks
      .map((link) => {
        const linkedReferenceId =
          link.sourceType === "reference" && link.sourceId !== reference.id
            ? link.sourceId
            : link.targetType === "reference" && link.targetId !== reference.id
              ? link.targetId
              : null;

        if (!linkedReferenceId) return null;

        const linkedReference = references.find(
          (item) => item.id === linkedReferenceId,
        );

        if (!linkedReference) return null;

        return {
          id: linkedReference.id,
          title: linkedReference.title,
        };
      })
      .filter(
        (
          linkedReference,
        ): linkedReference is NonNullable<typeof linkedReference> =>
          linkedReference !== null,
      );

    return {
      ...reference,
      linkCount:
        linkedNotes.length +
        linkedTasks.length +
        linkedCaptures.length +
        linkedReferences.length,
      linkedNotes,
      linkedTasks,
      linkedCaptures,
      linkedReferences,
    };
  });
}

export async function getReferenceEntityLinkCount(
  referenceId: string,
  userId: string,
) {
  const links = await db
    .select({
      id: entityLinks.id,
    })
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        or(
          and(
            eq(entityLinks.sourceType, "reference"),
            eq(entityLinks.sourceId, referenceId),
          ),
          and(
            eq(entityLinks.targetType, "reference"),
            eq(entityLinks.targetId, referenceId),
          ),
        ),
      ),
    );

  return links.length;
}
