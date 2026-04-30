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

export async function createCapture({
  id,
  userId,
  rawText,
  status = "new",
  createdAt,
  updatedAt,
}: {
  id: string;
  userId: string;
  rawText: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const result = await db
    .insert(captures)
    .values({
      id,
      userId,
      rawText,
      status,
      createdAt,
      updatedAt,
    })
    .returning();

  return result[0];
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
  status?: string;
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
  status: "new" | "analyzed" | "processed" | "archived";
}) {
  const result = await db
    .update(captures)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(captures.id, id))
    .returning();

  return result[0];
}

export async function deleteCapture(id: string) {
  const result = await db
    .delete(captures)
    .where(eq(captures.id, id))
    .returning();

  return result[0];
}
