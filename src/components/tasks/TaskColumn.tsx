"use client";

import { useState } from "react";
import NewTaskForm from "@/components/tasks/NewTaskForm";
import { TaskStatus } from "./Taskboard";
import { Task } from "@/db/schema";
import TaskCard from "@/components/tasks/TaskCard";

type TaskColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateTask: (input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: "low" | "medium" | "high";
    dueDate?: string;
  }) => Promise<void>;
  onEditTask: (
    taskId: string,
    data: {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    },
  ) => Promise<void>;
  openMenuTaskId: string | null;
  setOpenMenuTaskId: (taskId: string | null) => void;
};
const columnStyles: Record<
  TaskStatus,
  {
    wrapper: string;
    header: string;
    badge: string;
  }
> = {
  todo: {
    wrapper:
      "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
    header: "text-blue-800 dark:text-blue-200",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  },
  in_progress: {
    wrapper:
      "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    header: "text-amber-800 dark:text-amber-200",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  },
  awaiting: {
    wrapper:
      "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30",
    header: "text-purple-800 dark:text-purple-200",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  },
  done: {
    wrapper:
      "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
    header: "text-green-800 dark:text-green-200",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  },
  archived: {
    wrapper: "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900",
    header: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  },
};
export default function TaskColumn({
  title,
  status,
  tasks,
  onMoveTask,
  onArchiveTask,
  onCreateTask,
  onEditTask,
  openMenuTaskId,
  setOpenMenuTaskId
}: TaskColumnProps) {

    const [isCreating, setIsCreating] = useState(false);

    const styles = columnStyles[status];
  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData("taskId");

    if (!taskId) return;

    onMoveTask(taskId, status);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={`min-h-[500px] rounded-2xl border p-3 shadow-sm ${styles.wrapper}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2
          className={`text-sm font-semibold uppercase tracking-wide ${styles.header}`}
        >
          {title}
        </h2>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-1 text-xs ${styles.badge}`}>
            {tasks.length}
          </span>

          {status !== "archived" && (
            <button
              type="button"
              onClick={() => setIsCreating((current) => !current)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              +
            </button>
          )}
        </div>
      </div>

      {isCreating && status !== "archived" && (
        <NewTaskForm
          status={status}
          onCreateTask={async (input) => {
            await onCreateTask(input);
            setIsCreating(false);
          }}
        />
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onArchiveTask={onArchiveTask}
            onEditTask={onEditTask}
            isMenuOpen={openMenuTaskId === task.id}
            onOpenMenu={() => setOpenMenuTaskId(task.id)}
            onCloseMenu={() => setOpenMenuTaskId(null)}
          />
        ))}
      </div>
    </div>
  );
}
