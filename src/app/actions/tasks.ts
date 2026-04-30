"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTask,
  deleteTask,
  findSimilarTasks,
} from "@/db/queries/tasks";
import { type NewTask } from "@/db/schema";

export async function createTaskAction(input: NewTask) {
  const result = await createTaskWithDuplicateCheck(input);

  revalidateTasks();

  return result;
}

export async function updateTaskAction(id: string, data: Partial<NewTask>) {
  const task = await updateTask(id, data);

  revalidateTasks();

  return task;
}

export async function deleteTaskAction(id: string) {
  const task = await deleteTask(id);

  revalidateTasks();

  return task;
}

export async function createTaskWithDuplicateCheck(data: NewTask) {
  const similarTasks = await findSimilarTasks({
    userId: data.userId,
    title: data.title,
    description: data.description ?? undefined,
  });

  if (similarTasks.length > 0) {
    return {
      duplicate: true,
      similarTasks,
      task: null,
    };
  }

  const task = await createTask(data);

  return {
    duplicate: false,
    similarTasks: [],
    task,
  };
}

function revalidateTasks() {
  revalidatePath("/tasks");
  revalidatePath("/workspace");
  revalidatePath("/notes");
  revalidatePath("/capture");
}
