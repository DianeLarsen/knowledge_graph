import { and, desc, eq, isNull, inArray, or } from "drizzle-orm";
import { db } from "../index";
import {
  captures,
  events,
  notes,
  projectItems,
  projects,
  referencesTable,
  tasks,
  entityTags,
  tags,
  type EntityType,
  type NewProject,
  type NewProjectItem,
  type ProjectItem,
} from "../schema";

export type AvailableProjectItem = {
  id: string;
  title: string;
  entityType: EntityType;
};

type AddEntityToProjectInput = {
  userId: string;
  projectId: string;
  entityType: EntityType;
  entityId: string;
  projectRole?: NewProjectItem["projectRole"];
};

export type ProjectItemWithDetails = ProjectItem & {
  title: string;
  subtitle: string | null;
  href: string;
  status?: string | null;
  tags: {
    id: string;
    name: string;
  }[];
};

type CreateProjectInput = {
  userId: string;
  title: string;
  description?: string | null;
  visibility?: NewProject["visibility"];
  status?: NewProject["status"];
};

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

export async function getAllProjectById(projectId: string, userId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
    .limit(1);

  return project ?? null;
}

export async function createProject(
  userIdOrInput: string | CreateProjectInput,
  dataArg?: {
    title: string;
    description?: string | null;
    visibility?: NewProject["visibility"];
    status?: NewProject["status"];
  },
) {
  const input =
    typeof userIdOrInput === "string"
      ? {
          userId: userIdOrInput,
          title: dataArg?.title ?? "",
          description: dataArg?.description ?? null,
          visibility: dataArg?.visibility,
          status: dataArg?.status,
        }
      : userIdOrInput;

  const title = input.title.trim();

  if (!title) {
    throw new Error("Project title is required.");
  }

  const [project] = await db
    .insert(projects)
    .values({
      title,
      description: input.description ?? null,
      visibility: input.visibility ?? "private",
      status: input.status ?? "active",
      createdByUserId: input.userId,
      ownerId: input.userId,
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

export async function updateProjectStatus({
  userId,
  projectId,
  status,
}: {
  userId: string;
  projectId: string;
  status: "active" | "archived" | "completed";
}) {
  const [project] = await db
    .update(projects)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(eq(projects.id, projectId), eq(projects.createdByUserId, userId)),
    )
    .returning();

  return project;
}

export async function archiveProject(projectId: string, userId: string) {
  const [project] = await db
    .update(projects)
    .set({
      status: "archived",
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

export async function unarchiveProject(projectId: string, userId: string) {
  const [project] = await db
    .update(projects)
    .set({
      status: "active",
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
  userIdOrInput: string | AddEntityToProjectInput,
  dataArg?: {
    projectId: string;
    entityType: EntityType;
    entityId: string;
    projectRole?: NewProjectItem["projectRole"];
  },
) {
  const input =
    typeof userIdOrInput === "string"
      ? {
          userId: userIdOrInput,
          projectId: dataArg?.projectId ?? "",
          entityType: dataArg?.entityType,
          entityId: dataArg?.entityId ?? "",
          projectRole: dataArg?.projectRole,
        }
      : userIdOrInput;

  if (!input.projectId || !input.entityType || !input.entityId) {
    return null;
  }

  const project = await getProjectById(input.projectId, input.userId);

  if (!project) {
    return null;
  }

  const [item] = await db
    .insert(projectItems)
    .values({
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId,
      addedByUserId: input.userId,
      projectRole: input.projectRole ?? "working",
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

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export async function getProjectItemsWithDetails(
  projectId: string,
  userId: string,
): Promise<ProjectItemWithDetails[]> {
  const project = await getProjectById(projectId, userId);

  if (!project) {
    return [];
  }

  const items = await db
    .select()
    .from(projectItems)
    .where(eq(projectItems.projectId, projectId))
    .orderBy(desc(projectItems.createdAt));

  const noteIds = items
    .filter((item) => item.entityType === "note")
    .map((item) => item.entityId);

  const taskIds = items
    .filter((item) => item.entityType === "task")
    .map((item) => item.entityId);

  const referenceIds = items
    .filter((item) => item.entityType === "reference")
    .map((item) => item.entityId);

  const captureIds = items
    .filter((item) => item.entityType === "capture")
    .map((item) => item.entityId);

  const eventIds = items
    .filter((item) => item.entityType === "event")
    .map((item) => item.entityId);

  const tagConditions = [
    noteIds.length > 0
      ? and(
          eq(entityTags.entityType, "note"),
          inArray(entityTags.entityId, noteIds),
        )
      : undefined,
    taskIds.length > 0
      ? and(
          eq(entityTags.entityType, "task"),
          inArray(entityTags.entityId, taskIds),
        )
      : undefined,
    referenceIds.length > 0
      ? and(
          eq(entityTags.entityType, "reference"),
          inArray(entityTags.entityId, referenceIds),
        )
      : undefined,
    captureIds.length > 0
      ? and(
          eq(entityTags.entityType, "capture"),
          inArray(entityTags.entityId, captureIds),
        )
      : undefined,
    eventIds.length > 0
      ? and(
          eq(entityTags.entityType, "event"),
          inArray(entityTags.entityId, eventIds),
        )
      : undefined,
  ].filter(isDefined);

  const foundEntityTags =
    tagConditions.length > 0
      ? await db
          .select({
            entityType: entityTags.entityType,
            entityId: entityTags.entityId,
            tagId: tags.id,
            tagName: tags.name,
          })
          .from(entityTags)
          .innerJoin(tags, eq(entityTags.tagId, tags.id))
          .where(and(or(...tagConditions), isNull(tags.deletedAt)))
      : [];

  const tagsByEntity = new Map<string, { id: string; name: string }[]>();

  for (const row of foundEntityTags) {
    const key = `${row.entityType}:${row.entityId}`;
    const current = tagsByEntity.get(key) ?? [];

    current.push({
      id: row.tagId,
      name: row.tagName,
    });

    tagsByEntity.set(key, current);
  }

  const foundNotes =
    noteIds.length > 0
      ? await db.select().from(notes).where(inArray(notes.id, noteIds))
      : [];

  const foundTasks =
    taskIds.length > 0
      ? await db.select().from(tasks).where(inArray(tasks.id, taskIds))
      : [];

  const foundReferences =
    referenceIds.length > 0
      ? await db
          .select()
          .from(referencesTable)
          .where(inArray(referencesTable.id, referenceIds))
      : [];

  const foundCaptures =
    captureIds.length > 0
      ? await db.select().from(captures).where(inArray(captures.id, captureIds))
      : [];

  const foundEvents =
    eventIds.length > 0
      ? await db.select().from(events).where(inArray(events.id, eventIds))
      : [];

  const noteMap = new Map(foundNotes.map((note) => [note.id, note]));
  const taskMap = new Map(foundTasks.map((task) => [task.id, task]));
  const referenceMap = new Map(
    foundReferences.map((reference) => [reference.id, reference]),
  );
  const captureMap = new Map(
    foundCaptures.map((capture) => [capture.id, capture]),
  );
  const eventMap = new Map(foundEvents.map((event) => [event.id, event]));

  return items.map((item) => {
    if (item.entityType === "note") {
      const note = noteMap.get(item.entityId);

      return {
        ...item,
        title: note?.title ?? "Missing note",
        subtitle: note?.content ? note.content.slice(0, 120) : "Note",
        href: `/notes/${item.entityId}`,
        tags: tagsByEntity.get(`note:${item.entityId}`) ?? [],
      };
    }

    if (item.entityType === "task") {
      const task = taskMap.get(item.entityId);

      return {
        ...item,
        title: task?.title ?? "Missing task",
        subtitle: task?.description ?? "Task",
        status: task?.status ?? null,
        href: `/tasks#${item.entityId}`,
        tags: tagsByEntity.get(`task:${item.entityId}`) ?? [],
      };
    }

    if (item.entityType === "reference") {
      const reference = referenceMap.get(item.entityId);

      return {
        ...item,
        title: reference?.title ?? "Missing reference",
        subtitle: reference?.author ?? reference?.type ?? "Reference",
        href: `/references#${item.entityId}`,
        tags: tagsByEntity.get(`reference:${item.entityId}`) ?? [],
      };
    }

    if (item.entityType === "capture") {
      const capture = captureMap.get(item.entityId);

      return {
        ...item,
        title: capture?.summary ?? "Capture",
        subtitle: capture?.rawText
          ? capture.rawText.slice(0, 120)
          : "Captured thought",
        status: capture?.status ?? null,
        href: `/capture#${item.entityId}`,
        tags: tagsByEntity.get(`capture:${item.entityId}`) ?? [],
      };
    }

    if (item.entityType === "event") {
      const event = eventMap.get(item.entityId);

      return {
        ...item,
        title: event?.title ?? "Missing event",
        subtitle: event?.startDate ?? "Event",
        status: event?.status ?? null,
        href: `/calendar#${item.entityId}`,
        tags: tagsByEntity.get(`event:${item.entityId}`) ?? [],
      };
    }

    return {
      ...item,
      title: "Unknown item",
      subtitle: item.entityId,
      href: "#",
      tags: [],
    };
  });
}

export async function getAvailableProjectItems(
  projectId: string,
  userId: string,
): Promise<AvailableProjectItem[]> {
  const project = await getProjectById(projectId, userId);

  if (!project) {
    return [];
  }

  const existingProjectItems = await db
    .select()
    .from(projectItems)
    .where(eq(projectItems.projectId, projectId));

  const existingKeys = new Set(
    existingProjectItems.map((item) => `${item.entityType}:${item.entityId}`),
  );

  const [foundNotes, foundTasks, foundReferences, foundCaptures, foundEvents] =
    await Promise.all([
      db
        .select({
          id: notes.id,
          title: notes.title,
        })
        .from(notes)
        .where(and(eq(notes.ownerId, userId), isNull(notes.deletedAt))),

      db
        .select({
          id: tasks.id,
          title: tasks.title,
        })
        .from(tasks)
        .where(and(eq(tasks.ownerId, userId), isNull(tasks.deletedAt))),

      db
        .select({
          id: referencesTable.id,
          title: referencesTable.title,
        })
        .from(referencesTable)
        .where(
          and(
            eq(referencesTable.ownerId, userId),
            isNull(referencesTable.deletedAt),
          ),
        ),

      db
        .select({
          id: captures.id,
          title: captures.summary,
        })
        .from(captures)
        .where(and(eq(captures.ownerId, userId), isNull(captures.deletedAt))),

      db
        .select({
          id: events.id,
          title: events.title,
        })
        .from(events)
        .where(and(eq(events.ownerId, userId), isNull(events.deletedAt))),
    ]);

  const availableItems: AvailableProjectItem[] = [
    ...foundNotes.map((note) => ({
      id: note.id,
      title: note.title,
      entityType: "note" as const,
    })),

    ...foundTasks.map((task) => ({
      id: task.id,
      title: task.title,
      entityType: "task" as const,
    })),

    ...foundReferences.map((reference) => ({
      id: reference.id,
      title: reference.title,
      entityType: "reference" as const,
    })),

    ...foundCaptures.map((capture) => ({
      id: capture.id,
      title: capture.title ?? "Untitled capture",
      entityType: "capture" as const,
    })),

    ...foundEvents.map((event) => ({
      id: event.id,
      title: event.title,
      entityType: "event" as const,
    })),
  ];

  return availableItems
    .filter((item) => !existingKeys.has(`${item.entityType}:${item.id}`))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function deleteProject(projectId: string, userId: string) {
  const [project] = await db
    .update(projects)
    .set({
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

export async function updateProjectItemRole({
  userId,
  projectItemId,
  projectRole,
}: {
  userId: string;
  projectItemId: string;
  projectRole: "item" | "source" | "working" | "completed" | "reference";
}) {
  const [item] = await db
    .update(projectItems)
    .set({ projectRole })
    .where(eq(projectItems.id, projectItemId))
    .returning();

  return item;
}