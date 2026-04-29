"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTask, deleteTask } from "@/db/queries/tasks";
import { type NewTask } from "@/db/schema";

export async function createTaskAction(input: NewTask) {
  const task = await createTask(input);

  revalidatePath("/tasks");
  revalidatePath("/workspace");
  revalidatePath("/notes");

  return task;
}

export async function updateTaskAction(id: string, data: Partial<NewTask>) {
  const task = await updateTask(id, data);

  revalidatePath("/tasks");
  revalidatePath("/workspace");
  revalidatePath("/notes");

  return task;
}

export async function deleteTaskAction(id: string) {
  const task = await deleteTask(id);

  revalidatePath("/tasks");
  revalidatePath("/workspace");
  revalidatePath("/notes");

  return task;
}