"use server";

import { revalidatePath } from "next/cache";
import { createEvent } from "@/db/queries/calendar";
import { getCurrentUserId } from "@/lib/currentUser";
import { getEventsInRange, getTasksDueInRange } from "@/db/queries/calendar";
import { deleteEvent } from "@/db/queries/calendar";
import { redirect } from "next/navigation";
import { updateEvent } from "@/db/queries/calendar";

export async function getCalendarItems(userId: string, startDate: string, endDate: string) {
  const [calendarEvents, dueTasks] = await Promise.all([
    getEventsInRange(userId, startDate, endDate),
    getTasksDueInRange(userId, startDate, endDate),
  ]);

  return [
    ...calendarEvents.map((event) => ({
      id: event.id,
      type: "event" as const,
      title: event.title,
      description: event.description,
      date: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay,
      status: event.status,
      source: event,
    })),

    ...dueTasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: task.title,
      description: task.description,
      date: task.dueDate,
      priority: task.priority,
      status: task.status,
      source: task,
    })),
  ].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date.localeCompare(b.date);
  });
}

export async function createEventAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startDate = String(formData.get("startDate") || "").trim();
  const endDate = String(formData.get("endDate") || "").trim();

  if (!title || !startDate) {
    throw new Error("Title and start date are required.");
  }

  await createEvent({
    userId,
    title,
    description: description || null,
    startDate,
    endDate: endDate || startDate,
    allDay: true,
    status: "planned",
  });

  revalidatePath("/calendar");
}

export async function deleteEventAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const eventId = String(formData.get("eventId") || "");

  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  await deleteEvent(eventId, userId);

  revalidatePath("/calendar");
}

export async function updateEventAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const eventId = String(formData.get("eventId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startDate = String(formData.get("startDate") || "").trim();
  const endDate = String(formData.get("endDate") || "").trim();
  const location = String(formData.get("location") || "").trim();

  if (!eventId || !title || !startDate) {
    throw new Error("Event ID, title, and start date are required.");
  }

  await updateEvent(eventId, userId, {
    title,
    description: description || null,
    startDate,
    endDate: endDate || startDate,
    location: location || null,
  });

  revalidatePath("/calendar");
  redirect(`/calendar?year=${startDate.slice(0, 4)}&month=${Number(startDate.slice(5, 7)) - 1}&date=${startDate}`);
}