"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createNote } from "@/db/queries/notes";
import { getCurrentUserId } from "@/lib/currentUser";
import { analyzeCaptureText } from "@/lib/ai/analyzeCapture";
import { createTask, findSimilarTasks } from "@/db/queries/tasks";

import {
  createCapture,
  getCaptures as getCapturesQuery,
  getCaptureById,
  updateCaptureAnalysis,
  updateCaptureStatus,
} from "@/db/queries/captures";


type TaskPriority = "low" | "medium" | "high";

function parseTaskPriority(value: FormDataEntryValue | null): TaskPriority {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}


export async function createCaptureAction(formData: FormData) {
  const rawText = String(formData.get("rawText") ?? "").trim();

  if (!rawText) {
    return;
  }

  const userId = await getCurrentUserId();
  const now = new Date();

  await createCapture({
    id: randomUUID(),
    userId,
    rawText,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/capture");
}

export async function getCapturesAction() {
  return getCapturesQuery();
}

export async function analyzeCaptureAction(captureId: string) {
  const capture = await getCaptureById(captureId);

  if (!capture) {
    return;
  }

  const analysis = await analyzeCaptureText(capture.rawText);

  await updateCaptureAnalysis({
    id: captureId,
    summary: analysis.summary,
    analysisJson: JSON.stringify(analysis),
    status: "analyzed",
  });

  revalidatePath("/capture");
}

export async function markCaptureProcessedAction(captureId: string) {
  await updateCaptureStatus({
    id: captureId,
    status: "processed",
  });

  revalidatePath("/capture");
}

export async function createTaskFromCaptureAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = parseTaskPriority(formData.get("priority"));
  const captureId = String(formData.get("captureId") ?? "");
  const taskIndex = Number(formData.get("taskIndex"));
  const userId = await getCurrentUserId();

  if (!title || !captureId || Number.isNaN(taskIndex)) {
    return;
  }
const similarTasks = await findSimilarTasks({
  userId,
  title,
});

if (similarTasks.length > 0) {
  const capture = await getCaptureById(captureId);

  if (capture?.analysisJson) {
    const analysis = JSON.parse(capture.analysisJson);

    if (analysis.possibleTasks?.[taskIndex]) {
      analysis.possibleTasks[taskIndex] = {
        ...analysis.possibleTasks[taskIndex],
        duplicateWarning: true,
        similarTaskId: similarTasks[0].id,
        similarTaskTitle: similarTasks[0].title,
      };

      await updateCaptureAnalysis({
        id: captureId,
        summary: analysis.summary,
        analysisJson: JSON.stringify(analysis),
        status: capture.status,
      });
    }
  }

  revalidatePath("/capture");
  return;
}
  const task = await createTask({
    title,
    userId,
    description,
    priority,
    status: "todo",
  });

  const capture = await getCaptureById(captureId);

  if (capture?.analysisJson) {
    const analysis = JSON.parse(capture.analysisJson);

    if (analysis.possibleTasks?.[taskIndex]) {
      analysis.possibleTasks[taskIndex] = {
        ...analysis.possibleTasks[taskIndex],
        created: true,
        taskId: task?.id,
      };

      await updateCaptureAnalysis({
        id: captureId,
        summary: analysis.summary,
        analysisJson: JSON.stringify(analysis),
        status: capture.status,
      });
    }
  }

  revalidatePath("/capture");
  revalidatePath("/tasks");
}

export async function archiveCaptureAction(captureId: string) {
  await updateCaptureStatus({
    id: captureId,
    status: "archived",
  });

  revalidatePath("/capture");
}
export async function createNoteFromCaptureAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const captureId = String(formData.get("captureId") ?? "");
  const noteIndex = Number(formData.get("noteIndex"));
  const userId = await getCurrentUserId();

  if (!title || !captureId || Number.isNaN(noteIndex)) {
    return;
  }

  const note = await createNote({
    title,
    content,
    contentJson: JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: content
            ? [
                {
                  type: "text",
                  text: content,
                },
              ]
            : [],
        },
      ],
    }),
    userId,
  });

  const capture = await getCaptureById(captureId);

  if (capture?.analysisJson) {
    const analysis = JSON.parse(capture.analysisJson);

    if (analysis.possibleNotes?.[noteIndex]) {
      analysis.possibleNotes[noteIndex] = {
        ...analysis.possibleNotes[noteIndex],
        created: true,
        noteId: note?.id,
      };

      await updateCaptureAnalysis({
        id: captureId,
        summary: analysis.summary,
        analysisJson: JSON.stringify(analysis),
        status: capture.status,
      });
    }
  }

  revalidatePath("/capture");
  revalidatePath("/notes");
  revalidatePath("/workspace");
}