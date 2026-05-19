import { db } from "@/db";
import { captures, entityTags, entityLinks } from "@/db/schema";
import { and, desc, eq, inArray, or } from "drizzle-orm";

type CaptureStatus = "new" | "analyzed" | "processed" | "archived";

export async function getCapturesByUserId(userId: string) {
  const userCaptures = await db
    .select()
    .from(captures)
    .where(and(eq(captures.ownerType, "user"), eq(captures.ownerId, userId)))
    .orderBy(desc(captures.createdAt));

  if (userCaptures.length === 0) {
    return [];
  }

  const captureIds = userCaptures.map((capture) => capture.id);

  const captureTags = await db
    .select({
      entityId: entityTags.entityId,
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .where(
      and(
        eq(entityTags.entityType, "capture"),
        inArray(entityTags.entityId, captureIds),
      ),
    );

  const captureLinks = await db
    .select({
      sourceId: entityLinks.sourceId,
      targetType: entityLinks.targetType,
      targetId: entityLinks.targetId,
    })
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.sourceType, "capture"),
        inArray(entityLinks.sourceId, captureIds),
        or(
          eq(entityLinks.targetType, "note"),
          eq(entityLinks.targetType, "reference"),
        ),
      ),
    );

  return userCaptures.map((capture) => {
    const attachedTagIds = captureTags
      .filter((tag) => tag.entityId === capture.id)
      .map((tag) => tag.tagId);

    const linkedNoteIds = captureLinks
      .filter(
        (link) => link.sourceId === capture.id && link.targetType === "note",
      )
      .map((link) => link.targetId);

    const linkedReferenceIds = captureLinks
      .filter(
        (link) =>
          link.sourceId === capture.id && link.targetType === "reference",
      )
      .map((link) => link.targetId);

    return {
      ...capture,
      attachedTagIds,
      linkedNoteIds,
      linkedReferenceIds,
    };
  });
}

export async function getCaptureById(id: string, userId: string) {
  const [result] = await db
    .select()
    .from(captures)
    .where(
      and(
        eq(captures.id, id),
        eq(captures.ownerType, "user"),
        eq(captures.ownerId, userId),
      ),
    );

  return result ?? null;
}

export async function createCapture({
  userId,
  rawText,
  status = "new",
}: {
  userId: string;
  rawText: string;
  status?: CaptureStatus;
}) {
  const [result] = await db
    .insert(captures)
    .values({
      createdByUserId: userId,
      ownerType: "user",
      ownerId: userId,
      visibility: "private",
      rawText,
      status,
    })
    .returning();

  return result ?? null;
}

export async function updateCaptureAnalysis({
  id,
  userId,
  summary,
  analysisJson,
  status = "analyzed",
}: {
  id: string;
  userId: string;
  summary: string;
  analysisJson: string;
  status?: CaptureStatus;
}) {
  const [result] = await db
    .update(captures)
    .set({
      summary,
      analysisJson,
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(captures.id, id),
        eq(captures.ownerType, "user"),
        eq(captures.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function updateCaptureStatus({
  id,
  userId,
  status,
}: {
  id: string;
  userId: string;
  status: CaptureStatus;
}) {
  const [result] = await db
    .update(captures)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(captures.id, id),
        eq(captures.ownerType, "user"),
        eq(captures.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function deleteCapture(id: string, userId: string) {
  const [result] = await db
    .delete(captures)
    .where(
      and(
        eq(captures.id, id),
        eq(captures.ownerType, "user"),
        eq(captures.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function updateCaptureAnalysisJson({
  id,
  userId,
  analysisJson,
}: {
  id: string;
  userId: string;
  analysisJson: string;
}) {
  const [result] = await db
    .update(captures)
    .set({
      analysisJson,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(captures.id, id),
        eq(captures.ownerType, "user"),
        eq(captures.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}