import { db } from "@/db";
import { captures } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getCaptures() {
  return db.select().from(captures).orderBy(desc(captures.createdAt));
}

export async function getCaptureById(id: string) {
  const result = await db.select().from(captures).where(eq(captures.id, id));

  return result[0];
}

const captureStatuses = ["new", "analyzed", "processed", "archived"] as const;
type CaptureStatus = (typeof captureStatuses)[number];

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
  summary,
  analysisJson,
  status = "analyzed",
}: {
  id: string;
  summary: string;
  analysisJson: string;
  status?: CaptureStatus;
}) {
  const result = await db
    .update(captures)
    .set({
      summary,
      analysisJson,
      status,
      updatedAt: new Date(),
    })
    .where(eq(captures.id, id))
    .returning();

  return result[0];
}

export async function updateCaptureStatus({
  id,
  status,
}: {
  id: string;
  status: CaptureStatus;
}) {
  const [result] = await db
    .update(captures)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(captures.id, id))
    .returning();

  return result;
}

export async function deleteCapture(id: string) {
  const result = await db
    .delete(captures)
    .where(eq(captures.id, id))
    .returning();

  return result[0];
}
