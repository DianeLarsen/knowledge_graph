"use client";

import { useState, useEffect } from "react";
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

  const [duplicateWarning, setDuplicateWarning] = useState<{
    attemptedTask: {
      title: string;
      description?: string;
      status: TaskStatus;
      priority: "low" | "medium" | "high";
      dueDate?: string;
    };
    similarTasks: Task[];
  } | null>(null);
const [hoveredDuplicateTaskId, setHoveredDuplicateTaskId] = useState<
  string | null
  >(null);
  
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) return;

    const el = document.querySelector(hash);

    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    el.classList.add(
      "ring-2",
      "ring-yellow-400",
      "ring-offset-2",
      "animate-pulse",
    );

    const timeout = setTimeout(() => {
      el.classList.remove("ring-2", "ring-yellow-400", "ring-offset-2");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);
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
  const result = await createTaskAction({
    userId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    dueDate: input.dueDate,
  });

  if (result.duplicate) {
    setDuplicateWarning({
      attemptedTask: input,
      similarTasks: result.similarTasks,
    });
    return;
  }

  if (!result.task) return;

  setTasks((current) => [result.task!, ...current]);
  setDuplicateWarning(null);
}
async function createTaskAnyway() {
  if (!duplicateWarning) return;

  const task = await createTaskAction({
    userId,
    title: duplicateWarning.attemptedTask.title,
    description: duplicateWarning.attemptedTask.description,
    status: duplicateWarning.attemptedTask.status,
    priority: duplicateWarning.attemptedTask.priority,
    dueDate: duplicateWarning.attemptedTask.dueDate,
    skipDuplicateCheck: true,
  });

  if (task.task) {
    setTasks((current) => [task.task!, ...current]);
  }

  setDuplicateWarning(null);
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
      {duplicateWarning && (
        <div className="relative overflow-visible rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
          <p className="font-semibold">Possible duplicate task found:</p>

          <p className="mt-1 text-xs">
            You tried to create:{" "}
            <span className="font-semibold">
              {duplicateWarning.attemptedTask.title}
            </span>
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-5">
            {duplicateWarning.similarTasks.map((task) => (
              <li key={task.id} className="relative">
                <a
                  href={`/tasks#task-${task.id}`}
                  onMouseEnter={() => setHoveredDuplicateTaskId(task.id)}
                  onMouseLeave={() => setHoveredDuplicateTaskId(null)}
                  className="underline decoration-yellow-500 underline-offset-2 hover:text-yellow-600 dark:hover:text-yellow-100"
                >
                  {task.title}
                </a>
                {hoveredDuplicateTaskId === task.id && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 text-gray-800 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    <p className="font-semibold">{task.title}</p>

                    {task.description && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <p>Priority: {task.priority ?? "medium"}</p>
                      <p>Status: {task.status}</p>
                      {task.dueDate && <p>Due: {task.dueDate}</p>}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={createTaskAnyway}
              className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-yellow-700"
            >
              Create Anyway
            </button>

            <button
              type="button"
              onClick={() => setDuplicateWarning(null)}
              className="rounded-lg border border-yellow-400 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-100 dark:hover:bg-yellow-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
