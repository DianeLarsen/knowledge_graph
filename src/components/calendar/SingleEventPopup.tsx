// src/components/calendar/SingleEventPopup.tsx

import { Pencil, Trash2, X } from "lucide-react";
import { deleteEventAction } from "@/app/actions/calendar";
import {
  CalendarItem,
  NoteOption,
  TaskOption,
} from "@/components/calendar/types";

type SingleEventPopupProps = {
  event: CalendarItem;
  notes: NoteOption[];
  tasks: TaskOption[];
  onClose: () => void;
  onEdit: () => void;
};

export default function SingleEventPopup({
  event,
  notes,
  tasks,
  onClose,
  onEdit,
}: SingleEventPopupProps) {
  const linkedNote = notes.find((note) => note.id === event.noteId);
  const linkedTask = tasks.find((task) => task.id === event.taskId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-lg font-semibold text-gray-900 dark:text-gray-100">
              {event.title}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {event.date}
              {event.startTime && (
                <>
                  {" "}
                  • {event.startTime}
                  {event.endTime ? ` - ${event.endTime}` : ""}
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {event.description && (
          <p className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {event.description}
          </p>
        )}

        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {linkedNote && <p>Linked note: {linkedNote.title}</p>}
          {linkedTask && <p>Linked task: {linkedTask.title}</p>}
          {event.status && <p>Status: {event.status}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit event"
            title="Edit event"
            className="rounded-lg borderp-2 text-blue-700 hover:bg-blue-50 p-1 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <form
            action={deleteEventAction}
            onSubmit={(formEvent) => {
              const confirmed = window.confirm(
                "Delete this event? This cannot be undone.",
              );

              if (!confirmed) {
                formEvent.preventDefault();
              }
            }}
          >
            <input type="hidden" name="eventId" value={event.id} />
            <button
              type="submit"
              aria-label="Delete event"
              title="Delete event"
              className="rounded-lg borderp-2 text-red-700 hover:bg-red-60 p-1 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
