"use server";

import { db } from "@/db";
import { captures } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getCurrentUserId } from "@/lib/currentUser";
import { eq } from "drizzle-orm";

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

export async function analyzeCaptureAction(captureId: string) {
  const [capture] = await db
    .select()
    .from(captures)
    .where(eq(captures.id, captureId));

  if (!capture) {
    return;
  }

  const mockAnalysis = {
    summary:
      "This capture appears to contain project ideas, possible tasks, and next-step planning.",
    possibleTasks: [
      {
        title: "Review this capture and identify concrete tasks",
        priority: "medium",
        status: "new",
      },
      {
        title: "Decide whether any ideas should become notes",
        priority: "low",
        status: "new",
      },
    ],
    possibleNotes: [
      {
        title: "Captured idea",
        content: capture.rawText.slice(0, 300),
      },
    ],
    possibleReferences: [],
    aiPrompts: [
      "Turn this brain dump into a prioritized development plan.",
      "Extract tasks, notes, references, and open questions from this text.",
    ],
    nextSteps: [
      "Review the suggested tasks.",
      "Convert useful items into notes or tasks.",
      "Archive this capture once processed.",
    ],
    openQuestions: [
      "Which items are actionable right now?",
      "Which ideas should become long-term notes instead of tasks?",
    ],
    risks: [
      "The capture may include vague ideas that need clarification before turning into tasks.",
    ],
  };

  await db
    .update(captures)
    .set({
      summary: mockAnalysis.summary,
      analysisJson: JSON.stringify(mockAnalysis),
      status: "analyzed",
      updatedAt: new Date(),
    })
    .where(eq(captures.id, captureId));

  revalidatePath("/capture");
}