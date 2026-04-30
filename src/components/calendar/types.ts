export type CalendarItem = {
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

export type NoteOption = {
  id: string;
  title: string;
};

export type TaskOption = {
  id: string;
  title: string;
};
