"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/db/queries/users";
import {
  createUserEvent,
  deleteEvent,
  getEventsInRange,
  getTasksDueInRange,
  updateEvent,
} from "@/db/queries/calendar";
import {
  createEntityLink,
  deleteEntityLinksForSource,
} from "@/db/queries/entitylinks";

export async function getCalendarItems(
  userId: string,
  startDate: string,
  endDate: string,
) {
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
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
      status: event.status,
      noteId: event.noteId,
      taskId: event.taskId,
      source: event,
    })),

    ...dueTasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: task.title,
      description: task.description,
      date: task.dueDate,
      endDate: null,
      startTime: null,
      endTime: null,
      allDay: true,
      priority: task.priority,
      status: task.status,
      source: task,
      noteId: null,
      taskId: task.id,
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
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const noteId = String(formData.get("noteId") || "").trim();
  const taskId = String(formData.get("taskId") || "").trim();

  if (!title || !startDate) {
    throw new Error("Title and start date are required.");
  }

  const allDay = !startTime && !endTime;

  const event = await createUserEvent(userId, {
    title,
    description: description || null,
    startDate,
    endDate: endDate || startDate,
    startTime: startTime || null,
    endTime: endTime || null,
    allDay,
    location: location || null,
    status: "planned",
    noteId: noteId || null,
    taskId: taskId || null,
  });

  if (!event) {
    return null;
  }

  if (noteId) {
    await createEntityLink({
      createdByUserId: userId,
      sourceType: "event",
      sourceId: event.id,
      targetType: "note",
      targetId: noteId,
      relationshipType: "related",
    });
  }

  if (taskId) {
    await createEntityLink({
      createdByUserId: userId,
      sourceType: "event",
      sourceId: event.id,
      targetType: "task",
      targetId: taskId,
      relationshipType: "related",
    });
  }

  revalidatePath("/calendar");

  return event;
}

export async function deleteEventAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const eventId = String(formData.get("eventId") || "");

  if (!eventId) {
    throw new Error("Event ID is required.");
  }

  const deleted = await deleteEvent(eventId, userId);

  revalidatePath("/calendar");

  return deleted;
}

export async function updateEventAction(formData: FormData) {
  const userId = await getCurrentUserId();

  const eventId = String(formData.get("eventId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const startDate = String(formData.get("startDate") || "").trim();
  const endDate = String(formData.get("endDate") || "").trim();
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const noteId = String(formData.get("noteId") || "").trim();
  const taskId = String(formData.get("taskId") || "").trim();

  if (!eventId || !title || !startDate) {
    throw new Error("Event ID, title, and start date are required.");
  }

  const allDay = !startTime && !endTime;

  const event = await updateEvent(eventId, userId, {
    title,
    description: description || null,
    startDate,
    endDate: endDate || startDate,
    startTime: startTime || null,
    endTime: endTime || null,
    allDay,
    location: location || null,
    noteId: noteId || null,
    taskId: taskId || null,
  });

  if (!event) {
    return null;
  }

  await deleteEntityLinksForSource({
    userId,
    sourceType: "event",
    sourceId: eventId,
  });

  if (noteId) {
    await createEntityLink({
      createdByUserId: userId,
      sourceType: "event",
      sourceId: event.id,
      targetType: "note",
      targetId: noteId,
      relationshipType: "related",
    });
  }

  if (taskId) {
    await createEntityLink({
      createdByUserId: userId,
      sourceType: "event",
      sourceId: event.id,
      targetType: "task",
      targetId: taskId,
      relationshipType: "related",
    });
  }

  revalidatePath("/calendar");

  redirect(
    `/calendar?year=${startDate.slice(0, 4)}&month=${
      Number(startDate.slice(5, 7)) - 1
    }&date=${startDate}`,
  );
}
