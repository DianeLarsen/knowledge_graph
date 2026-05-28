// src/components/calendar/toCalendarItem.ts
import type { Event } from "@/db/schema";

export type CalendarItem = {
  id: string;
  type: "event" | "task";
  title: string;
  date: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  noteId?: string | null;
  taskId?: string | null;
  location?: string | null;
};

export type NoteOption = {
  id: string;
  title: string;
};

export type TaskOption = {
  id: string;
  title: string;
};

export function eventToCalendarItem(event: Event): CalendarItem {
  return {
    id: event.id,
    type: "event",
    title: event.title,
    date: String(event.startDate),
    startDate: String(event.startDate),
    endDate: event.endDate ? String(event.endDate) : null,
    startTime: event.startTime,
    endTime: event.endTime,
    allDay: event.allDay,
    description: event.description,
    status: event.status,
    noteId: event.noteId,
    taskId: event.taskId,
    location: event.location,
  };
}