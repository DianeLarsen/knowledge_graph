// src/components/calendar/EventDetailsPopup.tsx

import Link from "next/link";
import { deleteEventAction } from "@/app/actions/calendar";

type CalendarItem = {
  id: string;
  type: "event" | "task";
  title: string;
  date: string | null;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean | null;
  priority?: string | null;
};

type EventDetailsPopupProps = {
  date: string;
  items: CalendarItem[];
  onClose: () => void;
  onCreateEvent: () => void;
  onEditEvent: (item: CalendarItem) => void;
};

export default function EventDetailsPopup({
  date,
  items,
  onClose,
  onCreateEvent,
  onEditEvent,
}: EventDetailsPopupProps) {
     const dateKey = date;

     const dayItems = items
       .filter((item) => item.date?.slice(0, 10) === dateKey)
       .sort((a, b) => {
         if (a.allDay && !b.allDay) return -1;
         if (!a.allDay && b.allDay) return 1;

         const timeA = a.startTime ?? "99:99";
         const timeB = b.startTime ?? "99:99";

         return timeA.localeCompare(timeB);
       });
    

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {date}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {dayItems.length} item{dayItems.length === 1 ? "" : "s"} planned
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

        <button
          type="button"
          onClick={onCreateEvent}
          className="mb-4 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          Add Event on This Date
        </button>

        {dayItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nothing planned for this day.
          </p>
        ) : (
          <ul className="space-y-3">
            {dayItems.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>

                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {item.type}
                  </span>
                </div>

                {item.type === "event" && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.allDay
                      ? "All day"
                      : `${item.startTime ?? ""}${
                          item.endTime ? ` - ${item.endTime}` : ""
                        }`}
                  </p>
                )}

                {item.type === "task" && item.priority && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Priority: {item.priority}
                  </p>
                )}

                {item.description && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                )}

                {item.type === "event" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditEvent(item)}
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Edit
                    </button>

                    <form
                      action={deleteEventAction}
                      onSubmit={(event) => {
                        const confirmed = window.confirm(
                          "Delete this event? This cannot be undone.",
                        );

                        if (!confirmed) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="eventId" value={item.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
