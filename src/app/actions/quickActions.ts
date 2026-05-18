"use server";

import { revalidatePath } from "next/cache";

import type { EntityType } from "@/db/schema";
import { createUserTask } from "@/db/queries/tasks";
import { createNote } from "@/db/queries/notes";
import { createUserEvent } from "@/db/queries/calendar";
import { createProject } from "@/db/queries/projects";
import { addEntityToProject } from "@/db/queries/projects";
import { createTag } from "@/db/queries/tags";
import { attachTagToEntity } from "@/db/queries/entitytags";
import { createEntityLink } from "@/db/queries/entitylinks";
import { getCurrentUserId } from "@/db/queries/users";
import { createCapture } from "@/db/queries/captures";
import type { NewProjectItem } from "@/db/schema";
import type { NewEntityLink } from "@/db/schema";

function getRelationshipType(
  formData: FormData,
  fallback: NonNullable<NewEntityLink["relationshipType"]> = "related",
): NonNullable<NewEntityLink["relationshipType"]> {
  const value = getString(formData, "relationshipType");

  if (
    value === "related" ||
    value === "created_from" ||
    value === "supports" ||
    value === "blocks" ||
    value === "mentions" ||
    value === "uses" ||
    value === "follow_up" ||
    value === "depends_on" ||
    value === "duplicates" ||
    value === "is_duplicate_of" ||
    value === "references" ||
    value === "extends"
  ) {
    return value;
  }

  return fallback;
}

function getProjectRole(formData: FormData): NewProjectItem["projectRole"] {
  const value = getString(formData, "projectRole");

  if (
    value === "source" ||
    value === "working" ||
    value === "completed" ||
    value === "reference"
  ) {
    return value;
  }

  return "working";
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requireString(formData: FormData, key: string) {
  const value = getString(formData, key);

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

function getEntityContext(formData: FormData) {
  const sourceType = requireString(formData, "sourceType") as EntityType;
  const sourceId = requireString(formData, "sourceId");

  return { sourceType, sourceId };
}

function revalidateQuickActionPages() {
  revalidatePath("/notes");
  revalidatePath("/tasks");
  revalidatePath("/calendar");
  revalidatePath("/capture");
  revalidatePath("/projects");
  revalidatePath("/notes/references");
}

export async function createTaskFromEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const { sourceType, sourceId } = getEntityContext(formData);

  const title = requireString(formData, "title");
  const description = getString(formData, "description");

  const task = await createUserTask({
    userId,
    title,
    description: description || null,
    status: "todo",
    priority: "medium",
  });

  await createEntityLink({
    createdByUserId: userId,
    sourceType,
    sourceId,
    targetType: "task",
    targetId: task.id,
    relationshipType: "created_from",
    label: null,
  });

  revalidateQuickActionPages();

  return task;
}

export async function createCaptureFromEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const { sourceType, sourceId } = getEntityContext(formData);

  const rawText =
    getString(formData, "rawText") ||
    `Capture created from ${sourceType}: ${sourceId}`;

  const capture = await createCapture({
    userId,
    rawText,
    status: "new",
  });

  if (!capture) {
    throw new Error("Capture could not be created.");
  }

  await createEntityLink({
    createdByUserId: userId,
    sourceType,
    sourceId,
    targetType: "capture",
    targetId: capture.id,
    relationshipType: "created_from",
    label: null,
  });

  revalidateQuickActionPages();

  return capture;
}

export async function createLinkedNoteFromEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const { sourceType, sourceId } = getEntityContext(formData);

  const title = requireString(formData, "title");
  const content = getString(formData, "content");
  const relationshipType = getRelationshipType(formData, "extends");

  const note = await createNote({
    userId,
    title,
    content: content || "",
    contentJson: "",
  });

  if (!note) {
    throw new Error("Note could not be created.");
  }

  await createEntityLink({
    createdByUserId: userId,
    sourceType,
    sourceId,
    targetType: "note",
    targetId: note.id,
    relationshipType,
    label: null,
  });

  revalidateQuickActionPages();

  return note;
}

export async function createEventFromEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const { sourceType, sourceId } = getEntityContext(formData);

  const title = requireString(formData, "title");
  const startDate = requireString(formData, "startDate");
  const endDate = getString(formData, "endDate") || startDate;
  const startTime = getString(formData, "startTime");
  const endTime = getString(formData, "endTime");
  const allDay = formData.get("allDay") === "on" || !startTime;

  const event = await createUserEvent(userId, {
    title,
    description: null,
    location: null,
    startDate,
    endDate,
    startTime: allDay ? null : startTime,
    endTime: allDay ? null : endTime || null,
    allDay,
    status: "planned",
  });

  if (!event) {
    throw new Error("Event could not be created.");
  }

  await createEntityLink({
    createdByUserId: userId,
    sourceType,
    sourceId,
    targetType: "event",
    targetId: event.id,
    relationshipType: "created_from",
    label: null,
  });

  revalidateQuickActionPages();

  return event;
}

export async function createProjectAndAddEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const entityType = requireString(formData, "entityType") as EntityType;
  const entityId = requireString(formData, "entityId");
  const title = requireString(formData, "title");
  const description = getString(formData, "description");
  const projectRole = getProjectRole(formData);

  const project = await createProject({
    userId,
    title,
    description: description || null,
    visibility: "private",
    status: "active",
  });

  if (!project) {
    throw new Error("Project could not be created.");
  }

  await addEntityToProject({
    userId,
    projectId: project.id,
    entityType,
    entityId,
    projectRole,
  });

  revalidateQuickActionPages();

  return project;
}

export async function createTagAndAttachToEntityAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const entityType = requireString(formData, "entityType") as EntityType;
  const entityId = requireString(formData, "entityId");
  const name = requireString(formData, "name");

const tag = await createTag({
  userId,
  name,
  scopeType: "user",
  scopeId: userId,
  visibility: "private",
});

await attachTagToEntity({
  userId,
  entityType,
  entityId,
  tagId: tag.id,
});

  revalidateQuickActionPages();

  return tag;
}
