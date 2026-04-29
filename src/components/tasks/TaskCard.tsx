"use client";

import { useEffect, useState } from "react";
import { Task } from "@/db/schema";
import EditTaskModal from "@/components/tasks/EditTaskModal";

export type EditTaskInput = {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
};

type TaskCardProps = {
  task: Task;
  onArchiveTask: (taskId: string) => void;
  onEditTask: (taskId: string, data: EditTaskInput) => Promise<void>;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
};
const priorityStyles = {
  high: {
    card: "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    label: "High",
  },
  medium: {
    card: "border-yellow-300 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    label: "Medium",
  },
  low: {
    card: "border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    label: "Low",
  },
};
export default function TaskCard({
  task,
  onArchiveTask,
  onEditTask,
  isMenuOpen,
  onOpenMenu,
  onCloseMenu
}: TaskCardProps) {
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
    
    
  const [isEditing, setIsEditing] = useState(false);
const priority = task.priority ?? "medium";
    const styles = priorityStyles[priority];
    
useEffect(() => {
  function closeMenu() {
    onCloseMenu();
  }

  window.addEventListener("click", closeMenu);
  window.addEventListener("contextmenu", closeMenu);

  return () => {
    window.removeEventListener("click", closeMenu);
    window.removeEventListener("contextmenu", closeMenu);
  };
}, []);
  return (
    <>
      <article
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("taskId", task.id);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();

          setMenuPosition({ x: event.clientX, y: event.clientY });
          onOpenMenu();
        }}
        className={`cursor-grab rounded-xl border p-3 text-sm shadow-sm active:cursor-grabbing ${styles.card}`}
      >
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {task.title}
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span
            className={`rounded-full px-2 py-1 text-[11px] font-medium ${styles.badge}`}
          >
            {styles.label}
          </span>

          {task.dueDate && <span>{task.dueDate}</span>}
        </div>
      </article>

      {isMenuOpen && menuPosition && (
        <div
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.stopPropagation()}
          className="fixed z-50 w-40 rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              onCloseMenu();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Edit task
          </button>

          <button
            type="button"
            onClick={() => {
              onArchiveTask(task.id);
              onCloseMenu();
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            Archive
          </button>
        </div>
      )}

      {isEditing && (
        <EditTaskModal
          task={task}
          onClose={() => setIsEditing(false)}
          onSave={async (data) => {
            await onEditTask(task.id, data);
            setIsEditing(false);
          }}
        />
      )}
    </>
  );
}
