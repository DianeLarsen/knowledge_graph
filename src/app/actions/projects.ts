"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/db/queries/users";
import {
  addEntityToProject,
  archiveProject,
  createProject,
  getAvailableProjectItems,
  getProjectById,
  getProjectItems,
  getProjectItemsWithDetails,
  getUserProjects,
  removeEntityFromProject,
  updateProject,
  getAllProjectById,
  unarchiveProject,
  updateProjectItemRole,
} from "@/db/queries/projects";
import { createNote } from "@/db/queries/notes";
import { createUserTask } from "@/db/queries/tasks";
import { createUserReference } from "@/db/queries/references";
import { createUserEvent } from "@/db/queries/calendar";

import type { EntityType, NewProject, NewProjectItem } from "@/db/schema";

export async function createProjectAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibility = String(
    formData.get("visibility") ?? "private",
  ) as NewProject["visibility"];

  if (!title) {
    throw new Error("Project title is required");
  }

  await createProject(userId, {
    title,
    description: description || null,
    visibility,
    status: "active",
  });

  revalidatePath("/projects");
}

export async function updateProjectAction(
  projectId: string,
  formData: FormData,
) {
  const userId = await getCurrentUserId();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibility = String(
    formData.get("visibility") ?? "private",
  ) as NewProject["visibility"];

  const status = String(
    formData.get("status") ?? "active",
  ) as NewProject["status"];

  if (!title) {
    throw new Error("Project title is required");
  }

  const project = await updateProject(projectId, userId, {
    title,
    description: description || null,
    visibility,
    status,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return project;
}

export async function archiveProjectAction(projectId: string) {
  const userId = await getCurrentUserId();

  await archiveProject(projectId, userId);

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function unarchiveProjectAction(projectId: string) {
  const userId = await getCurrentUserId();

  await unarchiveProject(projectId, userId);

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
}

export async function addEntityToProjectAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const projectId = String(formData.get("projectId") ?? "");
  const entityType = String(formData.get("entityType") ?? "") as EntityType;
  const entityId = String(formData.get("entityId") ?? "");
  const projectRole = String(
    formData.get("projectRole") ?? "working",
  ) as NewProjectItem["projectRole"];

  if (!projectId || !entityType || !entityId) {
    throw new Error("Project, entity type, and entity ID are required");
  }

  const item = await addEntityToProject(userId, {
    projectId,
    entityType,
    entityId,
    projectRole,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);

  return item;
}

export async function removeEntityFromProjectAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const projectId = String(formData.get("projectId") ?? "");
  const entityType = String(formData.get("entityType") ?? "") as EntityType;
  const entityId = String(formData.get("entityId") ?? "");

  if (!projectId || !entityType || !entityId) {
    throw new Error("Project, entity type, and entity ID are required");
  }

  const item = await removeEntityFromProject(userId, {
    projectId,
    entityType,
    entityId,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);

  return item;
}

export async function getUserProjectsAction() {
  const userId = await getCurrentUserId();

  return getUserProjects(userId);
}

export async function getProjectByIdAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getProjectById(projectId, userId);
}

export async function getAllProjectByIdAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getAllProjectById(projectId, userId);
}

export async function getProjectItemsAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getProjectItems(projectId, userId);
}

export async function getProjectItemsWithDetailsAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getProjectItemsWithDetails(projectId, userId);
}

export async function getAvailableProjectItemsAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getAvailableProjectItems(projectId, userId);
}

export async function createProjectNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!projectId || !title) {
    throw new Error("Project and note title are required");
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

  if (!note) {
    throw new Error("Could not create note");
  }

  await addEntityToProject(userId, {
    projectId,
    entityType: "note",
    entityId: note.id,
    projectRole: "working",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  revalidatePath("/notes");
}

type CreateProjectTaskActionInput = {
  projectId: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "awaiting" | "done" | "archived";
  priority: "low" | "medium" | "high";
  dueDate?: string;
};

export async function createProjectTaskAction(
  input: CreateProjectTaskActionInput,
) {
  const userId = await getCurrentUserId();

  if (!input.projectId || !input.title.trim()) {
    throw new Error("Project and task title are required");
  }

  const task = await createUserTask(userId, {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate || null,
  });

  if (!task) {
    throw new Error("Could not create task");
  }

  await addEntityToProject(userId, {
    projectId: input.projectId,
    entityType: "task",
    entityId: task.id,
    projectRole: "working",
  });

  revalidatePath("/tasks");
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath(`/projects/${input.projectId}/workspace`);

  return task;
}

export async function createProjectReferenceAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!projectId || !title) {
    throw new Error("Project and reference title are required");
  }

  const reference = await createUserReference(userId, {
    type: url ? "website" : "other",
    title,
    url: url || null,
  });

  if (!reference) {
    throw new Error("Could not create reference");
  }

  await addEntityToProject(userId, {
    projectId,
    entityType: "reference",
    entityId: reference.id,
    projectRole: "reference",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  revalidatePath("/references");
}

export async function createProjectEventAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");

  if (!projectId || !title || !startDate) {
    throw new Error("Project, event title, and start date are required");
  }

  const event = await createUserEvent(userId, {
    title,
    startDate,
    endDate: startDate,
    allDay: true,
    status: "planned",
  });

  if (!event) {
    throw new Error("Could not create event");
  }

  await addEntityToProject(userId, {
    projectId,
    entityType: "event",
    entityId: event.id,
    projectRole: "working",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/workspace`);
  revalidatePath("/calendar");
}

export async function updateProjectItemRoleAction({
  projectItemId,
  projectRole,
}: {
  projectItemId: string;
  projectRole: "item" | "source" | "working" | "completed" | "reference";
}) {

  await updateProjectItemRole({
    projectItemId,
    projectRole,
  });

  revalidatePath("/projects");
}