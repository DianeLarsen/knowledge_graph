// src/components/calendar/EditEventPopup.tsx

import { updateEventAction } from "@/app/actions/calendar";
import EventFormFields from "@/components/calendar/EventFormFields";

type CalendarItem = {
  id: string;
  type: "event" | "task";
  title: string;
  date: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean | null;
  description?: string | null;
  status?: string;
  priority?: string | null;
  noteId?: string | null;
  taskId?: string | null;
};
type NoteOption = {
  id: string;
  title: string;
};

type TaskOption = {
  id: string;
  title: string;
};
type EditEventPopupProps = {
  event: CalendarItem;
  notes: NoteOption[];
  tasks: TaskOption[];
  onClose: () => void;
};

export default function EditEventPopup({
  event,
  notes,
  tasks,
  onClose,
}: EditEventPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Edit Event
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.date}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        <form
          action={updateEventAction}
          onSubmit={onClose}
          className="space-y-3"
        >
          <input type="hidden" name="eventId" value={event.id} />

          <EventFormFields
            defaultTitle={event.title}
            defaultDescription={event.description}
            defaultStartDate={event.date?.slice(0, 10) ?? ""}
            defaultEndDate={
              event.endDate?.slice(0, 10) ?? event.date?.slice(0, 10) ?? ""
            }
            defaultStartTime={event.startTime}
            defaultEndTime={event.endTime}
            defaultNoteId={event.noteId}
            defaultTaskId={event.taskId}
            notes={notes}
            tasks={tasks}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
