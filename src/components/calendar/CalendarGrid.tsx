// src/components/calendar/CalendarGrid.tsx

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
};

type CalendarGridProps = {
  year: number;
  month: number;
  items: CalendarItem[];
  todayDate?: string;
  selectedDate?: string | null;
  onSelectDate: (date: string) => void;
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
  onSelectDate,
}: CalendarGridProps) {
  const days = getMonthDays(year, month);
  function getItemClass(item: CalendarItem) {
    if (item.type === "event") {
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200";
    }

    if (item.priority === "high") {
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    }

    if (item.priority === "medium") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
    }

    if (item.priority === "low") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
    }

    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
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
            ? items
                .filter((item) => item.date?.slice(0, 10) === dateKey)
                .sort((a, b) => {
                  if (a.allDay && !b.allDay) return -1;
                  if (!a.allDay && b.allDay) return 1;

                  const timeA = a.startTime ?? "99:99";
                  const timeB = b.startTime ?? "99:99";

                  return timeA.localeCompare(timeB);
                })
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
                <button
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className="block h-full w-full text-left"
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
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className={`truncate rounded-md px-2 py-1 text-xs ${getItemClass(item)}`}
                      >
                        {item.startTime && (
                          <span className="mr-1 font-semibold">
                            {item.startTime}
                            {item.endTime ? `-${item.endTime}` : ""}
                          </span>
                        )}
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
