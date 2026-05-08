import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import {
  projectItems,
  projects,
  type EntityType,
  type NewProject,
  type NewProjectItem,
} from "../schema";

export async function getUserProjects(userId: string) {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.ownerId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: string, userId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, userId),
        isNull(projects.deletedAt),
      ),
    )
    .limit(1);

  return project ?? null;
}

export async function createProject(
  userId: string,
  data: {
    title: string;
    description?: string | null;
    visibility?: NewProject["visibility"];
    status?: NewProject["status"];
  },
) {
  const [project] = await db
    .insert(projects)
    .values({
      title: data.title,
      description: data.description ?? null,
      visibility: data.visibility ?? "private",
      status: data.status ?? "active",
      createdByUserId: userId,
      ownerId: userId,
    })
    .returning();

  return project ?? null;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    visibility?: NewProject["visibility"];
    status?: NewProject["status"];
  },
) {
  const [project] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();

  return project ?? null;
}

export async function archiveProject(projectId: string, userId: string) {
  const [project] = await db
    .update(projects)
    .set({
      status: "archived",
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.ownerId, userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();

  return project ?? null;
}

export async function addEntityToProject(
  userId: string,
  data: {
    projectId: string;
    entityType: EntityType;
    entityId: string;
    projectRole?: NewProjectItem["projectRole"];
  },
) {
  const project = await getProjectById(data.projectId, userId);

  if (!project) {
    return null;
  }

  const [item] = await db
    .insert(projectItems)
    .values({
      projectId: data.projectId,
      entityType: data.entityType,
      entityId: data.entityId,
      addedByUserId: userId,
      projectRole: data.projectRole ?? "working",
    })
    .onConflictDoNothing()
    .returning();

  return item ?? null;
}

export async function removeEntityFromProject(
  userId: string,
  data: {
    projectId: string;
    entityType: EntityType;
    entityId: string;
  },
) {
  const project = await getProjectById(data.projectId, userId);

  if (!project) {
    return null;
  }

  const [removedItem] = await db
    .delete(projectItems)
    .where(
      and(
        eq(projectItems.projectId, data.projectId),
        eq(projectItems.entityType, data.entityType),
        eq(projectItems.entityId, data.entityId),
      ),
    )
    .returning();

  return removedItem ?? null;
}

export async function getProjectItems(projectId: string, userId: string) {
  const project = await getProjectById(projectId, userId);

  if (!project) {
    return [];
  }

  return db
    .select()
    .from(projectItems)
    .where(eq(projectItems.projectId, projectId))
    .orderBy(desc(projectItems.createdAt));
}
