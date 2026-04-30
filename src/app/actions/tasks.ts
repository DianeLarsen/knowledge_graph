"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTask,
  deleteTask,
  findSimilarTasks,
} from "@/db/queries/tasks";
import { type NewTask } from "@/db/schema";
type CreateTaskInput = NewTask & {
  skipDuplicateCheck?: boolean;
};
export async function createTaskAction(input: CreateTaskInput) {
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

export async function createTaskWithDuplicateCheck(data: CreateTaskInput) {
  if (!data.skipDuplicateCheck) {
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
  }

  const { skipDuplicateCheck, ...taskData } = data;
  const task = await createTask(taskData);

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