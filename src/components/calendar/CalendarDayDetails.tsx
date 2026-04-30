// src/components/calendar/CalendarDayDetails.tsx
import { deleteEventAction } from "@/app/actions/calendar";
import Link from "next/link";

type CalendarItem = {
  id: string;
  type: "event" | "task";
  title: string;
  date: string | null;
  description?: string | null;
  status?: string;
  priority?: string | null;
};

type CalendarDayDetailsProps = {
  date: string;
  items: CalendarItem[];
};

export default function CalendarDayDetails({
  date,
  items,
}: CalendarDayDetailsProps) {
  const dayItems = items.filter((item) => item.date?.slice(0, 10) === date);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        {date}
      </h2>

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

              {item.description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {item.description}
                </p>
              )}
              {item.type === "event" && (
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/calendar/events/${item.id}/edit`}
                    className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Edit
                  </Link>

                  <form action={deleteEventAction}>
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
  );
}
