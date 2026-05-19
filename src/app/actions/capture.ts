"use server";

import { revalidatePath } from "next/cache";
import { createNote } from "@/db/queries/notes";
import { getCurrentUserId } from "@/db/queries/users";
import { analyzeCaptureText } from "@/lib/ai/analyzeCapture";
import { createUserTask, findSimilarTasks } from "@/db/queries/tasks";
import {
  createUserReference,
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
  updateCaptureAnalysisJson,
} from "@/db/queries/captures";
import { createProject, addEntityToProject } from "@/db/queries/projects";

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

function revalidateCaptureWorkflows() {
  revalidatePath("/capture");
  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/workspace");
  revalidatePath("/references");
  revalidatePath("/calendar");
}

export async function createCaptureFormAction(
  formData: FormData,
): Promise<void> {
  await createCaptureAction(formData);
}

export async function createCaptureAction(formData: FormData) {
  const rawText = String(formData.get("rawText") ?? "").trim();

  if (!rawText) {
    return null;
  }

  const userId = await getCurrentUserId();
  const rawStatus = String(formData.get("status") ?? "new");
  const status: CaptureStatus = isCaptureStatus(rawStatus) ? rawStatus : "new";

  const capture = await createCapture({
    userId,
    rawText,
    status,
  });

  revalidatePath("/capture");

  return capture;
}

export async function getCapturesAction() {
  const userId = await getCurrentUserId();
  return getCapturesByUserId(userId);
}

export async function analyzeCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();
  const capture = await getCaptureById(captureId, userId);

  if (!capture) {
    return null;
  }

  if (capture.analysisJson) {
    return capture;
  }

  const analysis = await analyzeCaptureText(capture.rawText);

  const updatedCapture = await updateCaptureAnalysis({
    id: captureId,
    userId,
    summary: analysis.summary,
    analysisJson: JSON.stringify(analysis),
    status: "analyzed",
  });

  revalidatePath("/capture");

  return updatedCapture;
}

export async function markCaptureProcessedAction(captureId: string) {
  const userId = await getCurrentUserId();

  const capture = await updateCaptureStatus({
    id: captureId,
    userId,
    status: "processed",
  });

  revalidatePath("/capture");

  return capture;
}

export async function archiveCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();

  const capture = await updateCaptureStatus({
    id: captureId,
    userId,
    status: "archived",
  });

  revalidatePath("/capture");

  return capture;
}

export async function deleteCaptureAction(captureId: string) {
  const userId = await getCurrentUserId();
  const capture = await getCaptureById(captureId, userId);

  if (!capture || capture.status !== "archived") {
    return null;
  }

  const deleted = await deleteCapture(captureId, userId);

  revalidatePath("/capture");

  return deleted;
}

export async function createTaskFromCaptureAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = parseTaskPriority(formData.get("priority"));
  const captureId = String(formData.get("captureId") ?? "");
  const taskIndex = Number(formData.get("taskIndex"));
  const userId = await getCurrentUserId();

  if (!title || !captureId || Number.isNaN(taskIndex)) {
    return null;
  }

  const similarTasks = await findSimilarTasks({
    userId,
    title,
    description,
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

    return {
      duplicate: true,
      similarTasks,
      task: null,
    };
  }

  const task = await createUserTask(userId, {
    title,
    description,
    priority,
    status: "todo",
  });

  if (!task) {
    return null;
  }

  await createEntityLink({
    createdByUserId: userId,
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
        taskId: task.id,
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

  revalidateCaptureWorkflows();

  return {
    duplicate: false,
    similarTasks: [],
    task,
  };
}

export async function createNoteFromCaptureAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const captureId = String(formData.get("captureId") ?? "");
  const noteIndex = Number(formData.get("noteIndex"));
  const userId = await getCurrentUserId();

  if (!title || !captureId || Number.isNaN(noteIndex)) {
    return null;
  }

  const note = await createNote({
    title,
    content,
    contentJson: makePlainTextContentJson(content),
    userId,
  });

  if (!note) {
    return null;
  }

  await createEntityLink({
    createdByUserId: userId,
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
        noteId: note.id,
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

  revalidateCaptureWorkflows();

  return note;
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
    return null;
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

    return {
      duplicate: true,
      reference: existingReference,
    };
  }

  const reference = await createUserReference(userId, {
    type,
    title,
    author,
    url,
    notes,
  });

  if (!reference) {
    return null;
  }

  await createEntityLink({
    createdByUserId: userId,
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
        referenceId: reference.id,
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

  revalidateCaptureWorkflows();

  return {
    duplicate: false,
    reference,
  };
}

export async function createProjectFromCaptureAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const captureId = String(formData.get("captureId") ?? "");
  const projectTitle = String(formData.get("projectTitle") ?? "").trim();
  const includeCapture = String(formData.get("includeCapture")) === "true";

  const selectedTaskIndexes = String(formData.get("selectedTaskIndexes") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  const selectedNoteIndexes = String(formData.get("selectedNoteIndexes") ?? "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  const selectedReferenceIndexes = String(
    formData.get("selectedReferenceIndexes") ?? "",
  )
    .split(",")
    .filter(Boolean)
    .map(Number);

  if (!captureId || !projectTitle) {
    throw new Error("Missing capture ID or project title.");
  }

  const capture = await getCaptureById(captureId, userId);

  if (!capture || capture.ownerId !== userId) {
    throw new Error("Capture not found.");
  }

  if (!capture.analysisJson) {
    throw new Error("Capture has not been analyzed.");
  }

  const analysis = JSON.parse(capture.analysisJson);

  const project = await createProject({
    userId,
    title: projectTitle,
    description: analysis.summary ?? null,
    visibility: "private",
    status: "active",
  });

  if (!project) {
    throw new Error("Could not create project.");
  }

  if (includeCapture) {
    await addEntityToProject({
      userId,
      projectId: project.id,
      entityType: "capture",
      entityId: capture.id,
      projectRole: "source",
    });
  }

  for (const index of selectedTaskIndexes) {
    const task = analysis.possibleTasks?.[index];
    if (!task) continue;

    let taskId = task.taskId;

    if (!task.created || !taskId) {
      const createdTask = await createUserTask({
        userId,
        title: task.title,
        description: task.description,
        priority: task.priority ?? "medium",
        status: "todo",
      });

      taskId = createdTask.id;

      analysis.possibleTasks[index] = {
        ...task,
        created: true,
        taskId,
      };
    }

    await addEntityToProject({
      userId,
      projectId: project.id,
      entityType: "capture",
      entityId: capture.id,
      projectRole: "source",
    });
  }

  for (const index of selectedNoteIndexes) {
    const note = analysis.possibleNotes?.[index];
    if (!note) continue;

    let noteId = note.noteId;

    if (!note.created || !noteId) {
      const createdNote = await createNote({
        userId,
        title: note.title,
        content: note.content,
        contentJson: makePlainTextContentJson(note.content),
      });

      noteId = createdNote.id;

      analysis.possibleNotes[index] = {
        ...note,
        created: true,
        noteId,
      };
    }

    await addEntityToProject({
      userId,
      projectId: project.id,
      entityType: "capture",
      entityId: capture.id,
      projectRole: "source",
    });
  }

  for (const index of selectedReferenceIndexes) {
    const reference = analysis.possibleReferences?.[index];
    if (!reference) continue;

    let referenceId = reference.referenceId;

    if (!reference.created || !referenceId) {
      const createdReference = await createUserReference(userId, {
        type: reference.type ?? "other",
        title: reference.title ?? "Untitled reference",
        author: reference.author || null,
        url: reference.url || null,
        publisher: null,
        publishedDate: null,
        notes: reference.notes || null,
      });

      referenceId = createdReference.id;

      analysis.possibleReferences[index] = {
        ...reference,
        created: true,
        referenceId,
      };
    }

    await addEntityToProject({
      userId,
      projectId: project.id,
      entityType: "capture",
      entityId: capture.id,
      projectRole: "source",
    });
  }
analysis.projectCreated = true;
analysis.projectId = project.id;
analysis.projectTitle = project.title;
  await updateCaptureAnalysisJson({
    id: captureId,
    userId,
    analysisJson: JSON.stringify(analysis),
  });

  revalidatePath("/capture");
  revalidatePath("/projects");

  return project;
}

function makePlainTextContentJson(content: string) {
  const paragraphs = content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraph,
        },
      ],
    }));

  return JSON.stringify({
    type: "doc",
    content:
      paragraphs.length > 0
        ? paragraphs
        : [
            {
              type: "paragraph",
            },
          ],
  });
}