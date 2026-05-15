"use client";

import { useState } from "react";
import Link from "next/link";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import EventDetailsPopup from "@/components/calendar/EventDetailsPopup";
import EventFormPopup from "@/components/calendar/EventFormPopup";
import EditEventPopup from "@/components/calendar/EditEventPopup";
import {
  CalendarItem,
  NoteOption,
  TaskOption,
} from "@/components/calendar/types";
import SingleEventPopup from "@/components/calendar/SingleEventPopup";
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
  tasks,
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
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null);

    
    function openEventDetails(item: CalendarItem) {
      setShowDetails(false);
      setShowCreateForm(false);
      setEditingEvent(null);
      setSelectedEvent(item);
    }
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
  <main className="min-h-screen space-y-6 bg-[rgb(var(--bg))] p-6 text-[rgb(var(--text))]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Calendar</h1>
        <p className="text-sm text-[rgb(var(--muted))]">
          Plan your events, deadlines, and scheduled work.
        </p>
      </div>

      <button
        type="button"
        onClick={() => openCreateForm(todayDate)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
      >
        New Event
      </button>
    </div>

    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/calendar?year=${previousMonth.getFullYear()}&month=${previousMonth.getMonth()}`}
          className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          Previous
        </Link>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
            {getMonthLabel(year, month)}
          </h2>

          <Link
            href={`/calendar?year=${today.getFullYear()}&month=${today.getMonth()}`}
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Today
          </Link>
        </div>

        <Link
          href={`/calendar?year=${nextMonth.getFullYear()}&month=${nextMonth.getMonth()}`}
          className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:bg-slate-200 dark:hover:bg-slate-800"
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
        onClose={() => setShowDetails(false)}
        onCreateEvent={() => openCreateForm(selectedDate)}
        onOpenEvent={openEventDetails}
      />
    )}

    {selectedEvent && (
      <SingleEventPopup
        event={selectedEvent}
        notes={notes}
        tasks={tasks}
        onClose={() => setSelectedEvent(null)}
        onEdit={() => {
          setSelectedEvent(null);
          openEditEvent(selectedEvent);
        }}
      />
    )}

    {editingEvent && (
      <EditEventPopup
        event={editingEvent}
        items={items}
        notes={notes}
        tasks={tasks}
        onClose={() => setEditingEvent(null)}
      />
    )}

    {showCreateForm && (
      <EventFormPopup
        selectedDate={createDate}
        items={items}
        notes={notes}
        tasks={tasks}
        onClose={() => setShowCreateForm(false)}
      />
    )}
  </main>
);
}
