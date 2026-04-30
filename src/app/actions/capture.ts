"use server";

import { db } from "@/db";
import { captures } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getCurrentUserId } from "@/lib/currentUser";


export async function createCaptureAction(formData: FormData) {
  const rawText = String(formData.get("rawText") ?? "").trim();
const userId = await getCurrentUserId();
  if (!rawText) {
    return;
  }

  const now = new Date();

  await db.insert(captures).values({
    id: randomUUID(),
    userId: userId,
    rawText,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/capture");
}

export async function getCaptures() {
  return db.select().from(captures).orderBy(desc(captures.createdAt));
}
