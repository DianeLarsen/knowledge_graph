// src/components/calendar/EditEventPopup.tsx
"use client";
import { updateEventAction } from "@/app/actions/calendar";
import EventFormFields from "@/components/calendar/EventFormFields";
import {
  CalendarItem,
  NoteOption,
  TaskOption,
} from "@/components/calendar/types";
import { useState } from "react";

type EditEventPopupProps = {
  event: CalendarItem;
  items: CalendarItem[];
  notes: NoteOption[];
  tasks: TaskOption[];
  onClose: () => void;
};

function timesOverlap(
  startA?: string | null,
  endA?: string | null,
  startB?: string | null,
  endB?: string | null,
) {
  if (!startA || !endA || !startB || !endB) return false;

  return startA < endB && startB < endA;
}

export default function EditEventPopup({
  event,
  notes,
  tasks,
  onClose,
  items,
}: EditEventPopupProps) {
  const [startDate, setStartDate] = useState(event.date?.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(
    event.endDate?.slice(0, 10) ?? event.date?.slice(0, 10) ?? "",
  );
  const [startTime, setStartTime] = useState(event.startTime ?? "");
  const [endTime, setEndTime] = useState(event.endTime ?? "");

  const conflicts = items.filter((item) => {
    if (item.id === event.id) return false;
    if (item.type !== "event") return false;
    if (item.date?.slice(0, 10) !== startDate) return false;
    if (item.allDay) return false;

    return timesOverlap(startTime, endTime, item.startTime, item.endTime);
  });
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
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            onStartDateChange={(value) => {
              setStartDate(value);
              setEndDate(value);
            }}
            onEndDateChange={setEndDate}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            notes={notes}
            tasks={tasks}
          />
          {conflicts.length > 0 && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
              This overlaps with:{" "}
              <span className="font-medium">
                {conflicts.map((conflict) => conflict.title).join(", ")}
              </span>
            </div>
          )}
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
