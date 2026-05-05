import { eq, and, ne } from "drizzle-orm";
import { db } from "../index";
import { tasks, type NewTask } from "../schema";
import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";
import { getCurrentUserId } from "./users";

export async function createTask(task: NewTask) {
  const [result] = await db.insert(tasks).values(task).returning();
  return result;
}

export async function getTasksByUserId(userId: string) {
  return await db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function getTaskById(id: string) {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, id));
  return result;
}

export async function getTaskOptionsForUser(userId: string) {
  return await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), ne(tasks.status, "archived")));
}

export async function updateTask(id: string, data: Partial<NewTask>) {
  const userId = await getCurrentUserId();
  const [result] = await db
    .update(tasks)
    .set(data)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();

  return result;
}

export async function deleteTask(id: string) {
  const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
  return result;
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
    .where(and(eq(tasks.userId, userId), ne(tasks.status, "archived")));

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
