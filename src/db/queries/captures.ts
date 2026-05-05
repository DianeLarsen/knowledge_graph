import { db } from "@/db";
import { captures } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

type CaptureStatus = "new" | "analyzed" | "processed" | "archived";

export async function getCapturesByUserId(userId: string) {
  return await db
    .select()
    .from(captures)
    .where(eq(captures.userId, userId))
    .orderBy(desc(captures.createdAt));
}

export async function getCaptureById(id: string, userId: string) {
  const [result] = await db
    .select()
    .from(captures)
    .where(and(eq(captures.id, id), eq(captures.userId, userId)));

  return result;
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
      userId,
      rawText,
      status,
    })
    .returning();

  return result;
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
    .where(and(eq(captures.id, id), eq(captures.userId, userId)))
    .returning();

  return result;
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
    .where(and(eq(captures.id, id), eq(captures.userId, userId)))
    .returning();

  return result;
}

export async function deleteCapture(id: string, userId: string) {
  const [result] = await db
    .delete(captures)
    .where(and(eq(captures.id, id), eq(captures.userId, userId)))
    .returning();

  return result;
}
