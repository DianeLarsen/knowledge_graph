import { and, eq } from "drizzle-orm";
import { db } from "../index";
import {
  entityLinks,
  notes,
  type EntityType,
  type NewEntityLink,
  type RelationshipType,
} from "../schema";

export async function createEntityLink(data: NewEntityLink) {
  const [result] = await db.insert(entityLinks).values(data).returning();
  return result;
}

export async function deleteEntityLink({
  userId,
  sourceType,
  sourceId,
  targetType,
  targetId,
  relationshipType,
}: {
  userId: string;
  sourceType: EntityType;
  sourceId: string;
  targetType: EntityType;
  targetId: string;
  relationshipType?: RelationshipType;
}) {
  const conditions = [
    eq(entityLinks.userId, userId),
    eq(entityLinks.sourceType, sourceType),
    eq(entityLinks.sourceId, sourceId),
    eq(entityLinks.targetType, targetType),
    eq(entityLinks.targetId, targetId),
  ];

  if (relationshipType) {
    conditions.push(eq(entityLinks.relationshipType, relationshipType));
  }

  return await db
    .delete(entityLinks)
    .where(and(...conditions))
    .returning();
}

export async function deleteEntityLinksForSource({
  userId,
  sourceType,
  sourceId,
}: {
  userId: string;
  sourceType: EntityType;
  sourceId: string;
}) {
  return await db
    .delete(entityLinks)
    .where(
      and(
        eq(entityLinks.userId, userId),
        eq(entityLinks.sourceType, sourceType),
        eq(entityLinks.sourceId, sourceId),
      ),
    )
    .returning();
}

export async function deleteEntityLinksForTarget({
  userId,
  targetType,
  targetId,
}: {
  userId: string;
  targetType: EntityType;
  targetId: string;
}) {
  return await db
    .delete(entityLinks)
    .where(
      and(
        eq(entityLinks.userId, userId),
        eq(entityLinks.targetType, targetType),
        eq(entityLinks.targetId, targetId),
      ),
    )
    .returning();
}

export async function getOutgoingLinks(noteId: string, userId?: string) {
  const conditions = [
    eq(entityLinks.sourceType, "note"),
    eq(entityLinks.sourceId, noteId),
  ];

  if (userId) {
    conditions.push(eq(entityLinks.userId, userId));
  }

  return await db
    .select({
      id: entityLinks.id,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      sourceType: entityLinks.sourceType,
      sourceId: entityLinks.sourceId,
      targetType: entityLinks.targetType,
      targetId: entityLinks.targetId,

      targetNoteId: notes.id,
      targetTitle: notes.title,
      targetContent: notes.content,
    })
    .from(entityLinks)
    .innerJoin(
      notes,
      and(
        eq(entityLinks.targetType, "note"),
        eq(entityLinks.targetId, notes.id),
      ),
    )
    .where(and(...conditions));
}

export async function getBacklinks(noteId: string, userId?: string) {
  const conditions = [
    eq(entityLinks.targetType, "note"),
    eq(entityLinks.targetId, noteId),
  ];

  if (userId) {
    conditions.push(eq(entityLinks.userId, userId));
  }

  return await db
    .select({
      id: entityLinks.id,
      relationshipType: entityLinks.relationshipType,
      label: entityLinks.label,
      sourceType: entityLinks.sourceType,
      sourceId: entityLinks.sourceId,
      targetType: entityLinks.targetType,
      targetId: entityLinks.targetId,

      sourceNoteId: notes.id,
      sourceTitle: notes.title,
      sourceContent: notes.content,
    })
    .from(entityLinks)
    .innerJoin(
      notes,
      and(
        eq(entityLinks.sourceType, "note"),
        eq(entityLinks.sourceId, notes.id),
      ),
    )
    .where(and(...conditions));
}