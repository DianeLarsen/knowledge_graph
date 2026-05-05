import { and, asc, eq, gte, lte, or, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { events, tasks, type NewEvent } from "@/db/schema";

export async function getEventsInRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  return await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        or(
          and(gte(events.startDate, startDate), lte(events.startDate, endDate)),
          and(
            isNotNull(events.endDate),
            gte(events.endDate, startDate),
            lte(events.endDate, endDate),
          ),
          and(
            isNotNull(events.endDate),
            lte(events.startDate, startDate),
            gte(events.endDate, endDate),
          ),
        ),
      ),
    )
    .orderBy(asc(events.startDate));
}

export async function getTasksDueInRange(
  userId: string,
  startDate: string,
  endDate: string,
) {
  return await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        ne(tasks.status, "archived"),
        gte(tasks.dueDate, startDate),
        lte(tasks.dueDate, endDate),
      ),
    )
    .orderBy(asc(tasks.dueDate));
}

export async function createEvent(data: NewEvent) {
  const [createdEvent] = await db.insert(events).values(data).returning();
  return createdEvent;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<NewEvent>,
) {
  const [updatedEvent] = await db
    .update(events)
    .set(data)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .returning();

  return updatedEvent;
}

export async function deleteEvent(eventId: string, userId: string) {
  const [deletedEvent] = await db
    .delete(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .returning();

  return deletedEvent;
}

export async function getEventById(eventId: string, userId: string) {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)));

  return event;
}
