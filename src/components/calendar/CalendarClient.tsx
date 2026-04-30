"use client";

import { useState } from "react";
import Link from "next/link";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import EventDetailsPopup from "@/components/calendar/EventDetailsPopup";
import EventFormPopup from "@/components/calendar/EventFormPopup";
import EditEventPopup from "@/components/calendar/EditEventPopup";

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
type CalendarClientProps = {
  year: number;
  month: number;
  items: CalendarItem[];
  notes: NoteOption[];
  tasks: TaskOption[];
};

function getMonthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function CalendarClient({
  year,
  month,
  items,
  notes,
  tasks
}: CalendarClientProps) {
  const today = new Date();
  const todayDate = today.toISOString().slice(0, 10);

  const previousMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDate, setCreateDate] = useState(todayDate);
const [editingEvent, setEditingEvent] = useState<CalendarItem | null>(null);
  function openDayDetails(date: string) {
    setSelectedDate(date);
    setShowDetails(true);
  }
function openEditEvent(item: CalendarItem) {
  setShowDetails(false);
  setShowCreateForm(false);
  setEditingEvent(item);
}
  function openCreateForm(date?: string) {
    setCreateDate(date ?? selectedDate ?? todayDate);
    setShowDetails(false);
    setShowCreateForm(true);
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plan your events, deadlines, and scheduled work.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateForm(todayDate)}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          New Event
        </button>
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
              href={`/calendar?year=${today.getFullYear()}&month=${today.getMonth()}`}
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
          onSelectDate={openDayDetails}
        />
      </section>

      {showDetails && selectedDate && (
        <EventDetailsPopup
          date={selectedDate}
          items={items}
          notes={notes}
          tasks={tasks}
          onClose={() => setShowDetails(false)}
          onCreateEvent={() => openCreateForm(selectedDate)}
          onEditEvent={openEditEvent}
        />
      )}
      {editingEvent && (
        <EditEventPopup
          event={editingEvent}
          notes={notes}
          tasks={tasks}
          onClose={() => setEditingEvent(null)}
        />
      )}
      {showCreateForm && (
        <EventFormPopup
          selectedDate={createDate}
          notes={notes}
          tasks={tasks}
          onClose={() => setShowCreateForm(false)}
        />
      )}
    </main>
  );
}
