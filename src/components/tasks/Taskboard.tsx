"use client";

import { useState } from "react";
import { Task } from "@/db/schema";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";

import TaskColumn from "@/components/tasks/TaskColumn";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "awaiting"
  | "done"
  | "archived";
type VisibleTaskStatus = Exclude<TaskStatus, "archived">;
type TaskBoardProps = {
  userId: string;
  initialTasks: Task[];
};

const baseColumns: { status: VisibleTaskStatus; title: string }[] = [
  { status: "todo", title: "New" },
  { status: "in_progress", title: "In Progress" },
  { status: "awaiting", title: "Awaiting Something" },
  { status: "done", title: "Done" },
];

export default function TaskBoard({ userId, initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [showArchived, setShowArchived] = useState(false);
    const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const columns = showArchived
    ? [...baseColumns, { status: "archived" as const, title: "Archived" }]
    : baseColumns;
  async function moveTask(taskId: string, newStatus: TaskStatus) {
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await updateTaskAction(taskId, { status: newStatus });
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    }
  }

  async function archiveTask(taskId: string) {
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, status: "archived" } : task,
      ),
    );

    try {
      await updateTaskAction(taskId, { status: "archived" });
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    }
  }

  async function createTask(input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: "low" | "medium" | "high";
    dueDate?: string;
  }) {
    const task = await createTaskAction({
      userId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      dueDate: input.dueDate,
    });

    setTasks((current) => [task, ...current]);
  }

  async function editTask(
    taskId: string,
    data: {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    },
  ) {
    const previousTasks = tasks;

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: data.title,
              description: data.description ?? null,
              priority: data.priority,
              dueDate: data.dueDate ?? null,
            }
          : task,
      ),
    );

    try {
      await updateTaskAction(taskId, data);
    } catch (error) {
      console.error(error);
      setTasks(previousTasks);
    }
  }

  function sortTasks(tasks: Task[]) {
    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return [...tasks].sort((a, b) => {
      const priorityA = priorityOrder[a.priority ?? "medium"];
      const priorityB = priorityOrder[b.priority ?? "medium"];

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tasks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag tasks between sections to update their status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowArchived((current) => !current)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {showArchived ? "Hide archive" : "Show archive"}
        </button>
      </div>

      <section
        className={`grid gap-4 ${
          showArchived
            ? "md:grid-cols-2 xl:grid-cols-5"
            : "md:grid-cols-2 xl:grid-cols-4"
        }`}
      >
        {columns.map((column) => {
          const columnTasks = sortTasks(
            tasks.filter((task) => task.status === column.status),
          );

          return (
            <TaskColumn
              key={column.status}
              title={column.title}
              status={column.status}
              tasks={columnTasks}
              onMoveTask={moveTask}
              onArchiveTask={archiveTask}
              onCreateTask={createTask}
              onEditTask={editTask}
              openMenuTaskId={openMenuTaskId}
              setOpenMenuTaskId={setOpenMenuTaskId}
            />
          );
        })}
      </section>
    </div>
  );
}
