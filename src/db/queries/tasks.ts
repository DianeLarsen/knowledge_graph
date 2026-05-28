import { and, eq, ne, isNull } from "drizzle-orm";
import { db } from "../index";
import { tasks, entityTags, entityLinks, projectItems, projects, type NewTask } from "../schema";
import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";
import { getCurrentUserId } from "./users";

export async function createTask(task: NewTask) {
  const [result] = await db.insert(tasks).values(task).returning();
  return result ?? null;
}

type CreateUserTaskData = {
  noteId?: string | null;
  title: string;
  description?: string | null;
  status?: NewTask["status"];
  priority?: NewTask["priority"];
  dueDate?: string | null;
};

type CreateUserTaskInput = CreateUserTaskData & {
  userId: string;
  visibility?: NewTask["visibility"];
};

export async function createUserTask(
  userIdOrInput: string | CreateUserTaskInput,
  taskArg?: CreateUserTaskData,
) {
  const input =
    typeof userIdOrInput === "string"
      ? {
          userId: userIdOrInput,
          task: taskArg,
        }
      : {
          userId: userIdOrInput.userId,
          task: userIdOrInput,
          visibility: userIdOrInput.visibility,
        };

  if (!input.task?.title?.trim()) {
    throw new Error("Task title is required.");
  }

  const [result] = await db
    .insert(tasks)
    .values({
      noteId: input.task.noteId ?? null,
      title: input.task.title.trim(),
      description: input.task.description ?? null,
      status: input.task.status ?? "todo",
      priority: input.task.priority ?? "medium",
      dueDate: input.task.dueDate ?? null,
      createdByUserId: input.userId,
      ownerType: "user",
      ownerId: input.userId,
      visibility: input.visibility ?? "private",
    })
    .returning();

  return result ?? null;
}

export async function getTasksByUserId(userId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.ownerType, "user"), eq(tasks.ownerId, userId)));
}

export async function getTaskById(id: string, userId: string) {
  const [result] = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.id, id),
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
        isNull(tasks.deletedAt),
      ),
    );

  return result ?? null;
}

export async function getTaskOptionsForUser(userId: string) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
        ne(tasks.status, "archived"),
      ),
    );
}

export async function updateTask(id: string, data: Partial<NewTask>) {
  const userId = await getCurrentUserId();

  const [result] = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tasks.id, id),
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function deleteTask(id: string) {
  const userId = await getCurrentUserId();

  const [result] = await db
    .delete(tasks)
    .where(
      and(
        eq(tasks.id, id),
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
      ),
    )
    .returning();

  return result ?? null;
}

export async function findSimilarTasks({
  userId,
  title,
  description,
}: {
  userId: string;
  title: string;
  description?: string;
}) {
  const DUPLICATE_TASK_THRESHOLD = 0.7;

  const newText = `${title}. ${description ?? ""}`;
  const newEmbedding = await getEmbedding(newText);

  const existingTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.ownerType, "user"),
        eq(tasks.ownerId, userId),
        ne(tasks.status, "archived"),
      ),
    );

  const results = [];

  for (const task of existingTasks) {
    const existingText = `${task.title}. ${task.description ?? ""}`;
    const existingEmbedding = await getEmbedding(existingText);

    const similarity = cosineSimilarity(newEmbedding, existingEmbedding);

    if (similarity >= DUPLICATE_TASK_THRESHOLD) {
      results.push({
        ...task,
        similarity,
      });
    }
  }

  return results;
}

export async function getTaskQuickActionState(userId: string) {
  const taskTags = await db
    .select({
      taskId: entityTags.entityId,
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .where(
      and(
        eq(entityTags.entityType, "task"),
        eq(entityTags.appliedByUserId, userId),
      ),
    );

  const taskLinks = await db
    .select({
      sourceId: entityLinks.sourceId,
      targetId: entityLinks.targetId,
      targetType: entityLinks.targetType,
    })
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.sourceType, "task"),
        eq(entityLinks.createdByUserId, userId),
      ),
    );

  const stateByTaskId = new Map<
    string,
    {
      attachedTagIds: string[];
      linkedNoteIds: string[];
      linkedReferenceIds: string[];
    }
  >();

  function ensureTaskState(taskId: string) {
    const existing = stateByTaskId.get(taskId);

    if (existing) return existing;

    const next = {
      attachedTagIds: [],
      linkedNoteIds: [],
      linkedReferenceIds: [],
    };

    stateByTaskId.set(taskId, next);

    return next;
  }

  for (const row of taskTags) {
    const state = ensureTaskState(row.taskId);
    state.attachedTagIds.push(row.tagId);
  }

  for (const row of taskLinks) {
    const state = ensureTaskState(row.sourceId);

    if (row.targetType === "note") {
      state.linkedNoteIds.push(row.targetId);
    }

    if (row.targetType === "reference") {
      state.linkedReferenceIds.push(row.targetId);
    }
  }

  return stateByTaskId;
}

export async function getTagIdsForTask(userId: string, taskId: string) {
  const rows = await db
    .select({
      tagId: entityTags.tagId,
    })
    .from(entityTags)
    .where(
      and(
        eq(entityTags.appliedByUserId, userId),
        eq(entityTags.entityType, "task"),
        eq(entityTags.entityId, taskId),
      ),
    );

  return rows.map((row) => row.tagId);
}

export async function getLinkedNoteIdsForTask(userId: string, taskId: string) {
  const rows = await db
    .select({
      noteId: entityLinks.targetId,
    })
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.sourceType, "task"),
        eq(entityLinks.sourceId, taskId),
        eq(entityLinks.targetType, "note"),
      ),
    );

  return rows.map((row) => row.noteId);
}

export async function getLinkedReferenceIdsForTask(
  userId: string,
  taskId: string,
) {
  const rows = await db
    .select({
      referenceId: entityLinks.targetId,
    })
    .from(entityLinks)
    .where(
      and(
        eq(entityLinks.createdByUserId, userId),
        eq(entityLinks.sourceType, "task"),
        eq(entityLinks.sourceId, taskId),
        eq(entityLinks.targetType, "reference"),
      ),
    );

  return rows.map((row) => row.referenceId);
}

export async function getLinkedProjectIdsForTask(
  userId: string,
  taskId: string,
) {
  const rows = await db
    .select({
      projectId: projectItems.projectId,
    })
    .from(projectItems)
    .innerJoin(
      projects,
      and(
        eq(projectItems.projectId, projects.id),
        eq(projects.ownerId, userId),
      ),
    )
    .where(
      and(
        eq(projectItems.entityType, "task"),
        eq(projectItems.entityId, taskId),
      ),
    );

  return rows.map((row) => row.projectId);
}