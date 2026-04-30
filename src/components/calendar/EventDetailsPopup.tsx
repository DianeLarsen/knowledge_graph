// src/components/calendar/EventDetailsPopup.tsx

import { deleteEventAction } from "@/app/actions/calendar";
import { Pencil, Trash2 } from "lucide-react";
import {
  CalendarItem,
  NoteOption,
  TaskOption,
} from "@/components/calendar/types";

type EventDetailsPopupProps = {
  date: string;
  items: CalendarItem[];
  notes: NoteOption[];
  tasks: TaskOption[];
  onClose: () => void;
  onCreateEvent: () => void;
  onEditEvent: (item: CalendarItem) => void;
  onOpenEvent: (item: CalendarItem) => void;
};

export default function EventDetailsPopup({
  date,
  items,
  notes,
  tasks,
  onClose,
  onCreateEvent,
  onEditEvent,
  onOpenEvent,
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
  const allDayItems = dayItems.filter((item) => item.allDay || !item.startTime);

  const timedItems = dayItems.filter(
    (item) => item.type === "event" && item.startTime && !item.allDay,
  );
  const laidOutTimedItems = layoutTimedItems(timedItems);
  const hours = Array.from({ length: 17 }, (_, index) => index + 6);
  // 6 AM through 10 PM
  function getNoteTitle(noteId?: string | null) {
    return notes.find((note) => note.id === noteId)?.title;
  }

  function getTaskTitle(taskId?: string | null) {
    return tasks.find((task) => task.id === taskId)?.title;
  }

  function timeToMinutes(time?: string | null) {
    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function getEventTop(startTime?: string | null) {
    const minutes = timeToMinutes(startTime);
    if (minutes === null) return 0;

    const startHour = 6; // timeline starts at 6 AM
    return ((minutes - startHour * 60) / 60) * 64;
  }

  function getEventHeight(startTime?: string | null, endTime?: string | null) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (start === null || end === null || end <= start) return 48;

    return Math.max(((end - start) / 60) * 64, 36);
  }
  function eventsOverlap(a: CalendarItem, b: CalendarItem) {
    const startA = timeToMinutes(a.startTime);
    const endA = timeToMinutes(a.endTime);
    const startB = timeToMinutes(b.startTime);
    const endB = timeToMinutes(b.endTime);

    if (startA === null || endA === null || startB === null || endB === null) {
      return false;
    }

    return startA < endB && startB < endA;
  }

  function layoutTimedItems(items: CalendarItem[]) {
    const sorted = [...items].sort((a, b) =>
      (a.startTime ?? "").localeCompare(b.startTime ?? ""),
    );

    const laidOut: (CalendarItem & {
      column: number;
      columnCount: number;
    })[] = [];

    for (const item of sorted) {
      const overlapping = laidOut.filter((existing) =>
        eventsOverlap(existing, item),
      );

      const usedColumns = new Set(overlapping.map((event) => event.column));

      let column = 0;
      while (usedColumns.has(column)) {
        column++;
      }

      laidOut.push({
        ...item,
        column,
        columnCount: Math.max(overlapping.length + 1, 1),
      });
    }

    return laidOut.map((item) => {
      const group = laidOut.filter(
        (other) => other.id === item.id || eventsOverlap(other, item),
      );

      const columnCount = Math.max(...group.map((event) => event.column)) + 1;

      return {
        ...item,
        columnCount,
      };
    });
  }
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
          <div className="space-y-4">
            {allDayItems.map((item) => {
              const cardContent = (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </p>

                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.type}
                    </span>
                  </div>

                  {item.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </>
              );

              if (item.type === "event") {
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => onOpenEvent(item)}
                    className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  {cardContent}
                </div>
              );
            })}

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Timeline
              </h3>

              <div className="relative min-h-[1088px] rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="relative h-16 border-b border-gray-200 dark:border-gray-800"
                  >
                    <span className="absolute left-2 top-1 text-xs text-gray-400">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}

                {laidOutTimedItems.map((item) => {
                  const gap = 8;
                  const leftBase = 64;
                  const rightPad = 12;

                  return (
                    <button
                      type="button"
                      key={`${item.type}-${item.id}`}
                      onClick={() => onOpenEvent(item)}
                      className="absolute overflow-hidden rounded-lg border border-blue-300 bg-blue-50 p-2 text-left text-xs text-blue-900 shadow-sm hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 dark:hover:bg-blue-900"
                      style={{
                        top: `${getEventTop(item.startTime)}px`,
                        height: `${getEventHeight(item.startTime, item.endTime)}px`,
                        left: `calc(${leftBase}px + ((100% - ${leftBase + rightPad}px) / ${item.columnCount}) * ${item.column})`,
                        width: `calc((100% - ${leftBase + rightPad}px) / ${item.columnCount} - ${gap}px)`,
                      }}
                    >
                      <div className="truncate font-semibold">
                        {item.startTime}
                        {item.endTime ? ` - ${item.endTime}` : ""} {item.title}
                      </div>

                      {item.description && (
                        <div className="mt-1 line-clamp-2 text-blue-800 dark:text-blue-200">
                          {item.description}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
