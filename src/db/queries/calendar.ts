import { and, asc, eq, gte, lte, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { events, tasks } from "@/db/schema";

export async function getEventsInRange(userId: string, startDate: string, endDate: string) {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        or(
          and(gte(events.startDate, startDate), lte(events.startDate, endDate)),
          and(gte(events.endDate, startDate), lte(events.endDate, endDate)),
          and(lte(events.startDate, startDate), gte(events.endDate, endDate)),
        ),
      ),
    )
    .orderBy(asc(events.startDate));
}

export async function getTasksDueInRange(userId: string, startDate: string, endDate: string) {
  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        gte(tasks.dueDate, startDate),
        lte(tasks.dueDate, endDate),
      ),
    )
    .orderBy(asc(tasks.dueDate));
}

export async function createEvent(data: typeof events.$inferInsert) {
  const [createdEvent] = await db.insert(events).values(data).returning();
  return createdEvent;
}

export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<typeof events.$inferInsert>,
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