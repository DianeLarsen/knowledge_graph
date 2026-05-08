"use server";

import { revalidatePath } from "next/cache";
import {
  createUserTask,
  updateTask,
  deleteTask,
  findSimilarTasks,
} from "@/db/queries/tasks";
import { getCurrentUserId } from "@/db/queries/users";
import { type NewTask } from "@/db/schema";

type CreateTaskInput = Omit<
  NewTask,
  "createdByUserId" | "ownerType" | "ownerId" | "visibility"
> & {
  skipDuplicateCheck?: boolean;
};

export async function createTaskAction(input: CreateTaskInput) {
  const userId = await getCurrentUserId();

  const result = await createTaskWithDuplicateCheck({
    ...input,
    userId,
  });

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

export async function createTaskWithDuplicateCheck(
  data: CreateTaskInput & { userId: string },
) {
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

  const task = await createUserTask(data.userId, {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    noteId: data.noteId,
  });

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
  revalidatePath("/calendar");
}
