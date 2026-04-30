import { and, eq, like } from "drizzle-orm";
import { db } from "../index";
import { tasks, type NewTask } from "../schema";
import { getEmbedding, cosineSimilarity } from "@/lib/ai/embeddings";

export async function createTask(task: NewTask) {
  const [result] = await db.insert(tasks).values(task).returning();
  return result;
}

export async function getTasksByUserId(userId: string) {
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function updateTask(id: string, data: Partial<NewTask>) {
  const [result] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
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
    .where(eq(tasks.userId, userId));

  const results = [];

  for (const task of existingTasks) {
    const existingText = `${task.title}. ${task.description ?? ""}`;
    const existingEmbedding = await getEmbedding(existingText);

    const score = cosineSimilarity(newEmbedding, existingEmbedding);

    console.log({
      newTask: title,
      existingTask: task.title,
      similarity: score,
    });

    if (score >= DUPLICATE_TASK_THRESHOLD) {
      results.push({
        ...task,
        similarity: score,
      });
    }
  }

  return results;
}