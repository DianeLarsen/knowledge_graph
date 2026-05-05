"use server";

"use server";

import { revalidatePath } from "next/cache";
import { createNote } from "@/db/queries/notes";
import { getCurrentUserId } from "@/db/queries/users";
import { analyzeCaptureText } from "@/lib/ai/analyzeCapture";
import { createTask, findSimilarTasks } from "@/db/queries/tasks";
import {
  createReference,
  findExistingReference,
} from "@/db/queries/references";
import { createEntityLink } from "@/db/queries/entitylinks";

import {
  createCapture,
  getCapturesByUserId,
  getCaptureById,
  updateCaptureAnalysis,
  updateCaptureStatus,
  deleteCapture,
} from "@/db/queries/captures";

type TaskPriority = "low" | "medium" | "high";

function parseTaskPriority(value: FormDataEntryValue | null): TaskPriority {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}
type ReferenceType =
  | "book"
  | "website"
  | "article"
  | "video"
  | "conversation"
  | "other";

function parseReferenceType(value: FormDataEntryValue | null): ReferenceType {
  if (
    value === "book" ||
    value === "website" ||
    value === "article" ||
    value === "video" ||
    value === "conversation" ||
    value === "other"
  ) {
    return value;
  }

  return "other";
}

const captureStatuses = ["new", "analyzed", "processed", "archived"] as const;

type CaptureStatus = (typeof captureStatuses)[number];

function isCaptureStatus(value: string): value is CaptureStatus {
  return captureStatuses.includes(value as CaptureStatus);
}

export async function createCaptureAction(formData: FormData) {
  const rawText = String(formData.get("rawText") ?? "").trim();

  if (!rawText) {
    return;
  }

  const userId = await getCurrentUserId();

  const rawStatus = String(formData.get("status") ?? "new");

  const status: CaptureStatus = isCaptureStatus(rawStatus) ? rawStatus : "new";

  await createCapture({
    userId,
    rawText,
    status,
  });

  revalidatePath("/capture");
}

export async function getCapturesAction() {
  const userId = await getCurrentUserId();
  return getCapturesByUserId(userId);
}

export async function analyzeCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();
  const capture = await getCaptureById(captureId, userId);

  if (!capture) {
    return;
  }

  if (capture.analysisJson) return;

  const analysis = await analyzeCaptureText(capture.rawText);

  await updateCaptureAnalysis({
    id: captureId,
    userId,
    summary: analysis.summary,
    analysisJson: JSON.stringify(analysis),
    status: "analyzed",
  });

  revalidatePath("/capture");
}

export async function markCaptureProcessedAction(captureId: string) {
  const userId = await getCurrentUserId();

  await updateCaptureStatus({
    id: captureId,
    userId,
    status: "processed",
  });

  revalidatePath("/capture");
}

export async function archiveCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();

  await updateCaptureStatus({
    id: captureId,
    userId,
    status: "archived",
  });

  revalidatePath("/capture");
}

export async function deleteCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();
  const capture = await getCaptureById(captureId, userId);

  if (!capture) {
    return;
  }

  if (capture.status !== "archived") {
    return;
  }

  await deleteCapture(captureId, userId);

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
    const capture = await getCaptureById(captureId, userId);

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
          userId,
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
  await createEntityLink({
    userId,
    sourceType: "capture",
    sourceId: captureId,
    targetType: "task",
    targetId: task.id,
    relationshipType: "created_from",
  });
  const capture = await getCaptureById(captureId, userId);

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
        userId,
      });
    }
  }

  revalidatePath("/capture");
  revalidatePath("/tasks");
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
await createEntityLink({
  userId,
  sourceType: "capture",
  sourceId: captureId,
  targetType: "note",
  targetId: note.id,
  relationshipType: "created_from",
});
  const capture = await getCaptureById(captureId, userId);

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
        userId,
      });
    }
  }

  revalidatePath("/capture");
  revalidatePath("/notes");
  revalidatePath("/workspace");
}

export async function createReferenceFromCaptureAction(formData: FormData) {
  const captureId = String(formData.get("captureId") ?? "");
  const referenceIndex = Number(formData.get("referenceIndex"));

  const type = parseReferenceType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const userId = await getCurrentUserId();

  if (!title || !captureId || Number.isNaN(referenceIndex)) {
    return;
  }
  const existingReference = await findExistingReference({
    userId,
    title,
    url,
  });

  if (existingReference) {
    const capture = await getCaptureById(captureId, userId);

    if (capture?.analysisJson) {
      const analysis = JSON.parse(capture.analysisJson);

      if (analysis.possibleReferences?.[referenceIndex]) {
        analysis.possibleReferences[referenceIndex] = {
          ...analysis.possibleReferences[referenceIndex],
          duplicateWarning: true,
          referenceId: existingReference.id,
          existingReferenceTitle: existingReference.title,
        };

        await updateCaptureAnalysis({
          id: captureId,
          summary: analysis.summary,
          analysisJson: JSON.stringify(analysis),
          status: capture.status,
          userId,
        });
      }
    }

    revalidatePath("/capture");

    return; // 🚨 THIS IS IMPORTANT — stops creation
  }
  const reference = await createReference({
    userId,
    type,
    title,
    author,
    url,
    notes,
  });
await createEntityLink({
  userId,
  sourceType: "capture",
  sourceId: captureId,
  targetType: "reference",
  targetId: reference.id,
  relationshipType: "created_from",
});
  const capture = await getCaptureById(captureId, userId);

  if (capture?.analysisJson) {
    const analysis = JSON.parse(capture.analysisJson);

    if (analysis.possibleReferences?.[referenceIndex]) {
      analysis.possibleReferences[referenceIndex] = {
        ...analysis.possibleReferences[referenceIndex],
        created: true,
        referenceId: reference?.id,
      };

      await updateCaptureAnalysis({
        id: captureId,
        summary: analysis.summary,
        analysisJson: JSON.stringify(analysis),
        status: capture.status,
        userId
      });
    }
  }

  revalidatePath("/capture");
  revalidatePath("/references");
  revalidatePath("/notes");
}
