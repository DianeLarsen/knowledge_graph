import { useState } from "react";
import { TaskStatus } from "@/components/tasks/Taskboard";

type NewTaskFormProps = {
  status: TaskStatus;
  startOpen?: boolean;
  hideToggle?: boolean;
  onCreateTask: (input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: "low" | "medium" | "high";
    dueDate?: string;
  }) => Promise<void>;
};

export default function NewTaskForm({
  status,
  startOpen = false,
  hideToggle = false,
  onCreateTask,
}: NewTaskFormProps) {
  const [isOpen, setIsOpen] = useState(startOpen);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || isSaving) return;

    try {
      setIsSaving(true);

      await onCreateTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");

      if (!hideToggle) {
        setIsOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen && !hideToggle) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="
          mb-3 w-full rounded-xl border border-dashed
          border-[rgb(var(--border))]
          bg-[rgb(var(--card))]
          px-3 py-2 text-left text-sm
          text-[rgb(var(--muted))]
          transition hover:bg-[rgb(var(--bg))]
          hover:text-[rgb(var(--text))]
        "
      >
        + New task
      </button>
    );
  }

  if (!isOpen && hideToggle) {
    return null;
  }

  return (
    <div
      className="
        mb-3 space-y-2 rounded-xl border
        border-[rgb(var(--border))]
        bg-[rgb(var(--card))]
        p-3 text-[rgb(var(--text))]
        shadow-sm
      "
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        className="
          w-full rounded-lg border
          border-[rgb(var(--border))]
          bg-[rgb(var(--bg))]
          px-3 py-2 text-sm
          text-[rgb(var(--text))]
          outline-none
          placeholder:text-[rgb(var(--muted))]
          focus:border-blue-400
          focus:ring-2 focus:ring-blue-500/20
        "
      />

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description"
        rows={2}
        className="
          w-full rounded-lg border
          border-[rgb(var(--border))]
          bg-[rgb(var(--bg))]
          px-3 py-2 text-sm
          text-[rgb(var(--text))]
          outline-none
          placeholder:text-[rgb(var(--muted))]
          focus:border-blue-400
          focus:ring-2 focus:ring-blue-500/20
        "
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as "low" | "medium" | "high")
          }
          className="
            rounded-lg border border-[rgb(var(--border))]
            bg-[rgb(var(--bg))]
            px-3 py-2 text-sm
            text-[rgb(var(--text))]
            outline-none
            focus:border-blue-400
            focus:ring-2 focus:ring-blue-500/20
          "
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="
            rounded-lg border border-[rgb(var(--border))]
            bg-[rgb(var(--bg))]
            px-3 py-2 text-sm
            text-[rgb(var(--text))]
            outline-none
            focus:border-blue-400
            focus:ring-2 focus:ring-blue-500/20
          "
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !title.trim()}
          className="
            rounded-lg bg-blue-600 px-3 py-2 text-sm
            font-medium text-white transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:bg-[rgb(var(--border))]
            disabled:text-[rgb(var(--muted))]
          "
        >
          {isSaving ? "Adding..." : "Add"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!hideToggle) {
              setIsOpen(false);
            }

            setTitle("");
            setDescription("");
            setPriority("medium");
            setDueDate("");
          }}
          className="
            rounded-lg border border-[rgb(var(--border))]
            bg-[rgb(var(--bg))]
            px-3 py-2 text-sm
            text-[rgb(var(--muted))]
            transition hover:bg-[rgb(var(--card))]
            hover:text-[rgb(var(--text))]
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
