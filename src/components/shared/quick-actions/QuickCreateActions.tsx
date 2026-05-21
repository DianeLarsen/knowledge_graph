"use client";

import { useState } from "react";
import { Plus, CheckSquare, Zap, CalendarDays } from "lucide-react";
import type { EntityType } from "@/db/schema";

import {
  createTaskFromEntityAction,
  createCaptureFromEntityAction,
  createLinkedNoteFromEntityAction,
  createEventFromEntityAction,
} from "@/app/actions/quickActions";
import type { QuickCreateSuggestion } from "@/lib/types/quickSuggestions";
import QuickSuggestionChips from "@/components/shared/quick-actions/QuickSuggestionChips";

type QuickCreateActionsProps = {
  entityType: EntityType;
  entityId: string;
  suggestions?: QuickCreateSuggestion[];
  onSuggest?: () => void;
  isSuggesting?: boolean;
};

export default function QuickCreateActions({
  entityType,
  entityId,
  suggestions = [],
  onSuggest,
  isSuggesting = false,
}: QuickCreateActionsProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [eventTitle, setEventTitle] = useState("");

  async function handleCreateTask(formData: FormData) {
    await createTaskFromEntityAction(formData);
    setTaskTitle("");
  }

  async function handleCreateLinkedNote(formData: FormData) {
    await createLinkedNoteFromEntityAction(formData);
    setNoteTitle("");
  }

  async function handleCreateEvent(formData: FormData) {
    await createEventFromEntityAction(formData);
    setEventTitle("");
  }

  async function handleCreateCapture(formData: FormData) {
    await createCaptureFromEntityAction(formData);
  }
  const inputClass =
    "w-full rounded-xl border border-[rgb(var(--border))] bg-white px-3 py-2 text-sm text-[rgb(var(--text))] shadow-sm placeholder:text-[rgb(var(--muted))] focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-slate-950 dark:focus:ring-blue-900";

  const primaryButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600";

  const secondaryButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900";

  const captureButtonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900";

  return (
    <div className="space-y-3">
      {onSuggest && (
        <button
          type="button"
          onClick={onSuggest}
          disabled={isSuggesting}
          className="w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          {isSuggesting ? "Thinking..." : "Suggest creates"}
        </button>
      )}
      <QuickSuggestionChips
        title="Suggested creates"
        suggestions={suggestions}
        getKey={(suggestion) => `${suggestion.type}-${suggestion.title}`}
        getLabel={(suggestion) => `${suggestion.type}: ${suggestion.title}`}
        getDescription={(suggestion) => suggestion.reason}
        onSelect={(suggestion) => {
          if (suggestion.type === "task") setTaskTitle(suggestion.title);
          if (suggestion.type === "note") setNoteTitle(suggestion.title);
          if (suggestion.type === "event") setEventTitle(suggestion.title);
        }}
      />
      <form action={handleCreateTask} className="space-y-2">
        <input type="hidden" name="sourceType" value={entityType} />
        <input type="hidden" name="sourceId" value={entityId} />

        <input
          name="title"
          required
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          placeholder={`Task from this ${entityType}`}
          className={inputClass}
        />

        <button className={primaryButtonClass}>
          <CheckSquare size={16} />
          Create task
        </button>
      </form>

      {entityType !== "capture" && (
        <form action={handleCreateCapture}>
          <input type="hidden" name="sourceType" value={entityType} />
          <input type="hidden" name="sourceId" value={entityId} />

          <button className={captureButtonClass}>
            <Zap size={16} />
            Capture from this {entityType}
          </button>
        </form>
      )}

      <form action={handleCreateLinkedNote} className="space-y-2">
        <input type="hidden" name="sourceType" value={entityType} />
        <input type="hidden" name="sourceId" value={entityId} />
        <input type="hidden" name="relationshipType" value="extends" />

        <input
          name="title"
          required
          value={noteTitle}
          onChange={(event) => setNoteTitle(event.target.value)}
          placeholder="New linked note title"
          className={inputClass}
        />

        <button className={secondaryButtonClass}>
          <Plus size={16} />
          Create linked note
        </button>
      </form>

      <form action={handleCreateEvent} className="space-y-2">
        <input type="hidden" name="sourceType" value={entityType} />
        <input type="hidden" name="sourceId" value={entityId} />

        <input
          name="title"
          required
          value={eventTitle}
          onChange={(event) => setEventTitle(event.target.value)}
          placeholder="New event title"
          className={inputClass}
        />

        <input name="startDate" type="date" required className={inputClass} />

        <button className={secondaryButtonClass}>
          <CalendarDays size={16} />
          Create event
        </button>
      </form>
    </div>
  );
}
