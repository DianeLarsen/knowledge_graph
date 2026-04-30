// src/app/calendar/page.tsx

import Link from "next/link";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import { getCalendarItems } from "../actions/calendar";
import { getCurrentUserId } from "@/lib/currentUser";
import CalendarDayDetails from "@/components/calendar/CalendarDayDetails";
import NewEventForm from "@/components/calendar/NewEventForm";



type CalendarPageProps = {
  searchParams?: Promise<{
    year?: string;
    month?: string;
    date?: string;
  }>;
};

function getMonthRange(year: number, month: number) {
  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  return { startDate, endDate };
}

function getMonthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
    const params = await searchParams;
  const userId = await getCurrentUserId();

  const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDate = today.toISOString().slice(0, 10);
  const year = params?.year
    ? Number(params.year)
    : today.getFullYear();

  const month = params?.month
    ? Number(params.month)
    : today.getMonth();

  const { startDate, endDate } = getMonthRange(year, month);

  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const items = await getCalendarItems(userId, startDate, endDate);
const selectedDate =
    params?.date ?? new Date(year, month, 1).toISOString().slice(0, 10);
    
  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Calendar
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Plan your events, deadlines, and scheduled work.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/calendar?year=${previousMonth.getFullYear()}&month=${previousMonth.getMonth()}`}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Previous
          </Link>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getMonthLabel(year, month)}
            </h2>

            <Link
              href={`/calendar?year=${todayYear}&month=${todayMonth}&date=${todayDate}`}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Today
            </Link>
          </div>

          <Link
            href={`/calendar?year=${nextMonth.getFullYear()}&month=${nextMonth.getMonth()}`}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Next
          </Link>
        </div>

        <CalendarGrid
          year={year}
          month={month}
          items={items}
          todayDate={todayDate}
          selectedDate={selectedDate}
        />
        <CalendarDayDetails date={selectedDate} items={items} />
        <NewEventForm selectedDate={selectedDate} />
      </section>
    </main>
  );
}
