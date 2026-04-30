import CalendarClient from "@/components/calendar/CalendarClient";
import { getCalendarItems } from "../actions/calendar";
import { getCurrentUserId } from "@/lib/currentUser";
import { getNotesByUser } from "@/db/queries/notes";
import { getTasksByUserId } from "@/db/queries/tasks";

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

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;
  const userId = await getCurrentUserId();

  const today = new Date();

  const year = params?.year ? Number(params.year) : today.getFullYear();
  const month = params?.month ? Number(params.month) : today.getMonth();

  const { startDate, endDate } = getMonthRange(year, month);

  const [items, notes, tasks] = await Promise.all([
    getCalendarItems(userId, startDate, endDate),
    getNotesByUser(userId),
    getTasksByUserId(userId),
  ]);
  return (
    <CalendarClient
      year={year}
      month={month}
      items={items}
      notes={notes}
      tasks={tasks}
    />
  );
}
