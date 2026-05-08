import { and, eq, ne } from "drizzle-orm";
import { db } from "../index";
import { tasks, type NewTask } from "../schema";
import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";
import { getCurrentUserId } from "./users";

export async function createTask(task: NewTask) {
  const [result] = await db.insert(tasks).values(task).returning();
  return result ?? null;
}

export async function createUserTask(
  userId: string,
  task: Omit<
    NewTask,
    "createdByUserId" | "ownerType" | "ownerId" | "visibility"
  >,
) {
  const [result] = await db
    .insert(tasks)
    .values({
      ...task,
      createdByUserId: userId,
      ownerType: "user",
      ownerId: userId,
      visibility: "private",
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
