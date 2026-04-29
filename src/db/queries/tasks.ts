import { eq } from "drizzle-orm";
import { db } from "../index";
import { tasks, type NewTask } from "../schema";

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