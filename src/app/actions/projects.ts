"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/db/queries/users";
import {
  addEntityToProject,
  archiveProject,
  createProject,
  getProjectById,
  getProjectItems,
  getUserProjects,
  removeEntityFromProject,
  updateProject,
} from "@/db/queries/projects";

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

export async function getProjectItemsAction(projectId: string) {
  const userId = await getCurrentUserId();

  return getProjectItems(projectId, userId);
}