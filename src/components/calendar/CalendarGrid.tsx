// src/components/calendar/CalendarGrid.tsx
import Link from "next/link";


type CalendarItem = {
  id: string;
  type: "event" | "task";
  title: string;
  date: string | null;
  status?: string;
  priority?: string | null;
};

type CalendarGridProps = {
  year: number;
  month: number;
  items: CalendarItem[];
  todayDate?: string;
  selectedDate?: string;
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  const startPadding = firstDay.getDay();

  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarGrid({
  year,
  month,
  items,
  todayDate,
  selectedDate,
}: CalendarGridProps) {
  const days = getMonthDays(year, month);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateKey = date ? formatDate(date) : null;
          const dayItems = dateKey
            ? items.filter((item) => item.date?.slice(0, 10) === dateKey)
            : [];
const isToday = dateKey === todayDate;
          const isSelected = dateKey === selectedDate;
          return (
            <div
              key={index}
              className={`min-h-28 border-b border-r border-gray-200 p-2 dark:border-gray-700 ${
                isToday ? "bg-yellow-50 dark:bg-yellow-950/30" : ""
              } ${isSelected ? "ring-2 ring-blue-400 ring-inset" : ""}`}
            >
              {date && dateKey && (
                <Link
                  href={`/calendar?year=${year}&month=${month}&date=${dateKey}`}
                  className="block h-full"
                >
                  <div
                    className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? "bg-yellow-400 text-gray-900"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayItems.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`truncate rounded-md px-2 py-1 text-xs ${
                          item.type === "task"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                            : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                        }`}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
